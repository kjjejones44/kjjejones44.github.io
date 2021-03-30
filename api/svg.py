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

with open(FILE, "r") as f:
    pop_map = json.load(f)

while True:
    req = requests.get("https://anvaka.github.io/map-of-reddit-data/graph.svg")
    if req.status_code == 200:
        break
    req.raise_for_status()

b = ElementTree.fromstring(str(req.content, encoding="utf-8"))
output = []
for subreddit in b.find("*/[@id='nodes']/*[@id='Gay-92']", namespaces={None: "http://www.w3.org/2000/svg"}):
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

with open(FILE, "w") as f:
    json.dump(pop_map, f)

with open("gs.json", "w") as f:
    json.dump(output, f)
