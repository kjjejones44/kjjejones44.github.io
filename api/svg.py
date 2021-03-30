from xml.etree import ElementTree
from math import log
import json
import requests
import praw

FILE = "pop.json"

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

tree = ElementTree.fromstring(str(req.content, encoding="utf-8"))
output = []
for subreddit in tree.find("*/[@id='nodes']/*[@id='Gay-92']", namespaces={None: "http://www.w3.org/2000/svg"}):
    attrs = dict(subreddit.attrib)
    for x in ['cx', 'cy', 'r']:
        attrs[x] = float(attrs[x])
    output.append(attrs)

min_x = min(x['cx'] for x in output)
min_y = min(x['cy'] for x in output)
max_x = max(x['cx'] for x in output)
max_y = max(x['cy'] for x in output)

for subreddit in output:
    subreddit['cx'] = 100 * ((subreddit['cx'] - min_x) / (max_x - min_x))
    subreddit['cy'] = 100 * ((subreddit['cy'] - min_y) / (max_y - min_y))
    subreddit['pop'] = get_pop_value(subreddit['id'])
    for key in ["cx", "cy", "r", "pop"]:
        subreddit[key] = round(subreddit[key], 5)
        
output.sort(key=lambda x: x['r'], reverse=True)

json_dump(FILE, pop_map)
json_dump("gs.json", output)

# import json
# import requests

# SPLIT = " -> "

# with open("gs.json", "r") as f:
#     subs = json.load(f)

# sub_ids = [x['id'] for x in subs]
# sub_dict = {x['id']:x for x in subs}


# while True:
#     req = requests.get("https://anvaka.github.io/map-of-reddit-data/graph.svg")
#     if req.status_code == 200:
#         break
#     req.raise_for_status()

# with open("r.dot", "r", encoding="utf-8") as f:
#     lines = [x for x in f.readlines() if SPLIT in x]

# links = set()
# for x in lines:
#     sub_1 = x.split(SPLIT, 1)[0].strip("\"")
#     sub_2 = x.split(SPLIT, 1)[1].split(" [")[0].strip("\"")
#     sub_list = [sub_1, sub_2]
#     if all(x in sub_dict for x in sub_list):
#         sub_list.sort(key=lambda x: sub_dict[x]["r"])
#         links.add(tuple(sub_list))

# links = list(list(x) for x in links)

# links.sort(key=lambda x: sub_dict[x[1]]['r'])
# links.sort(key=lambda x: sub_dict[x[0]]['r'])

# new = []
# connected_count = {}
# for link in links:
#     for sub in link:
#         if not sub in connected_count:
#             connected_count[sub] = 0
#         else:
#             connected_count[sub] = connected_count[sub] + 1
#     link.sort(key=lambda x: connected_count[x])

# new = []
# for link in links:
#     if link[0] not in [x[0] for x in new]:
#         new.append(link)

# new = list(list(x) for x in set(tuple(x) for x in new))

# for link in new:    
#     for i in range(len(link)):
#         sub = sub_dict[link[i]]
#         link[i] = {"x": sub['cx'], "y": sub['cy']}
        
# with open("links2.json", "w") as f:
#     json.dump(new, f)

