from xml.etree import ElementTree
from math import log
import json
import requests
import praw

FILE = "pop.json"
SPLIT = " -> "

# www.reddit.com/r/dataisbeautiful/mfmlho/

def get_pop_value(subreddit_id):
    if not subreddit_id in pop_map:
        pop_map[subreddit_id] = reddit(subreddit_id)
    return pop_map[subreddit_id]


def reddit(subreddit_name):
    if not 'reddit' in reddit.__dict__:
        reddit.reddit = praw.Reddit(
            client_id="rj6E-nkf-Ku7dg",
            client_secret="qsvUZYhtX1fsij8JgjT4UcWY7CY",
            user_agent="savedChecker"
        )
    try:
        return log(reddit.reddit.subreddit(subreddit_name).widgets.id_card.currentlyViewingCount)
    except:
        return 0

def json_dump(file, object):    
    with open(file, "w", encoding="utf-8") as f:
        json.dump(object, f)

with open(FILE, "r") as f:
    pop_map = json.load(f)

while True:
    req = requests.get("https://anvaka.github.io/map-of-reddit-data/graph.svg")
    if req.status_code == 200:
        break
    req.raise_for_status()

sub_dict = {}

tree = ElementTree.fromstring(str(req.content, encoding="utf-8"))
ns = {None: "http://www.w3.org/2000/svg"}
for node in tree.findall("*/[@id='nodes']", namespaces=ns):
    for subreddit in node.findall("*/", namespaces=ns):
        attrs = dict(subreddit.attrib)
        attrs["id"] = attrs["id"].strip("_")
        for line in ['cx', 'cy', 'r']:
            attrs[line] = float(attrs[line])
        sub_dict[attrs["id"]] = attrs

gay_ids = [x.attrib["id"].strip("_") for x in tree.find("*/[@id='nodes']/*[@id='Gay-92']", namespaces=ns)]
gay_subs = [sub_dict[x] for x in gay_ids]
gay_subs.sort(key=lambda x: x['r'], reverse=True)


min_x = min(x['cx'] for x in gay_subs)
min_y = min(x['cy'] for x in gay_subs)
max_x = max(x['cx'] for x in gay_subs)
max_y = max(x['cy'] for x in gay_subs)

for subreddit in gay_subs:
    subreddit['cx'] = 100 * ((subreddit['cx'] - min_x) / (max_x - min_x))
    subreddit['cy'] = 100 * ((subreddit['cy'] - min_y) / (max_y - min_y))
    subreddit['pop'] = get_pop_value(subreddit['id'])
    for key in ["cx", "cy", "r", "pop"]:
        subreddit[key] = round(subreddit[key], 5)
        
json_dump(FILE, pop_map)
json_dump("gs.json", gay_subs)

with open("r.dot", "r", encoding="utf-8") as f:
    dot_lines = [x for x in f.readlines() if SPLIT in x]

links = set()
for line in dot_lines:
    sub_1 = line.split(SPLIT, 1)[0].strip("\"")
    sub_2 = line.split(SPLIT, 1)[1].split(" [")[0].strip("\"")
    sub_list = [sub_1, sub_2]
    if all(x in gay_ids for x in sub_list):
        sub_list.sort(key=lambda x: sub_dict[x]["r"])
        links.add(tuple(sub_list))

links = list(list(x) for x in links)

for link in links:    
    for i in range(len(link)):
        sub = sub_dict[link[i]]
        link[i] = {"x": sub['cx'], "y": sub['cy']}
        
with open("links.json", "w") as f:
    json.dump(links, f)

