import requests
import json

def fetch_threat_data(api_url):
    if api_url == 'mock://threats':
        return {'urls': [{'threat': 'Malware', 'url': 'http://malware.example.com'}, {'threat': 'Phishing', 'url': 'http://phishing.example.com'}, {'threat': 'Malware', 'url': 'http://virus.example.com'}, {'threat': 'Ransomware', 'url': 'http://crypto.example.com'}, {'threat': 'Phishing', 'url': 'http://login.example.com'}]}
    try:
        response = requests.get(api_url)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except Exception as e:
        print(f'Error fetching data: {e}')
        return None

def aggregate_data(sources):
    aggregate_data = []
    for source in sources:
        data = fetch_threat_data(source['api_url'])
        if data and 'urls' in data:
            aggregate_data.extend(data['urls'])
    return aggregate_data
if __name__ == '__main__':
    sources = [{'api_url': 'mock://threats'}]
    aggregate_data = aggregate_data(sources)
    with open('./data/aggregated_data.json', 'w') as outfile:
        json.dump(aggregate_data, outfile, indent=4)
    print(f'aggregated {len(aggregate_data)} threat intelligence entries.')