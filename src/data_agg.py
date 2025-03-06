import requests
import json

def fetch_threat_data(api_url):
    response = requests.get(api_url)
    if response.status_code==200:
        return response.json()
    else:
        return None
    
def aggregate_data(sources):
    aggregate_data=[]
    for source in sources:
        data = fetch_threat_data(source['api_url'])
        if data and "urls" in data:
            aggregate_data.extend(data["urls"])
    return aggregate_data

if __name__ == "__main__":
    sources=[
        {
             "api_url": "enter ur api"
        }    
    ]
    aggregate_data = aggregate_data(sources)
    with open("./data/aggregated_data.json","w") as outfile:
        json.dump(aggregate_data, outfile, indent=4)
    print(f"aggregated {len(aggregate_data)} threat intelligence entries.")

