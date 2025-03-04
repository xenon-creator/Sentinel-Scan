import json
import pandas as pd

def analyze_data(data):
    df = pd.DataFrame(data)

    if "threat" not in df.columns:
        print("No 'threat' column found in data!")
        return {}

    threat_counts = df['threat'].value_counts().to_dict()
    return threat_counts

if __name__ == "__main__":
    with open("./data/aggregated_data.json",'r') as infile:
        data = json.load(infile)
    threat_counts = analyze_data(data)

    with open("./data/threat_counts.json", 'w') as outfile:
        json.dump(threat_counts, outfile, indent=4)

    print("threat counts")
    print(threat_counts)