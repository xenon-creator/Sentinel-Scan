import requests
import json
import pandas as pd

# Fetch threat data from the API
def fetch_threat_data(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Aggregate data from multiple sources
def aggregate_data(sources):
    aggregated_data = []
    for source in sources:
        data = fetch_threat_data(source['api_url'])
        if data and "urls" in data:  # Ensure "urls" exists in the response
            aggregated_data.extend(data["urls"])  # Extract only relevant threat data
    return aggregated_data

if __name__ == "__main__":
    sources = [
        {
            "api_url": "https://urlhaus-api.abuse.ch/v1/urls/recent/"
        }
    ]
    
    # Fetch and save aggregated data
    aggregated_data = aggregate_data(sources)
    with open("./data/aggregated_data.json", 'w') as outfile:
        json.dump(aggregated_data, outfile, indent=4)
    
    print(f"Aggregated {len(aggregated_data)} threat intelligence entries.")

# ---- Data Analysis ----

# Analyze the collected threat data
def analyze_data(data):
    df = pd.DataFrame(data)
    
    if "threat" not in df.columns:
        print("No 'threat' column found in data!")
        return {}

    # Count occurrences of each threat type
    threat_counts = df['threat'].value_counts().to_dict()

    return threat_counts

if __name__ == "__main__":
    with open("./data/aggregated_data.json", 'r') as infile:
        data = json.load(infile)
    
    threat_counts = analyze_data(data)

    # Save the analysis results
    with open("./data/threat_counts.json", 'w') as outfile:
        json.dump(threat_counts, outfile, indent=4)

    print("Threat Counts:")
    print(threat_counts)

# ---- Generating Insights ----

# Generate security insights based on analyzed data
def generate_insights(threat_counts):
    insights = []
    for threat, count in threat_counts.items():
        if count > 10:
            insights.append(f"High frequency of {threat} detected: {count} occurrences.")
        else:
            insights.append(f"Moderate presence of {threat}: {count} occurrences.")
    return insights

if __name__ == "__main__":
    with open("./data/threat_counts.json", 'r') as infile:
        threat_counts = json.load(infile)
    
    insights = generate_insights(threat_counts)

    # Save insights
    with open("./data/insights.json", 'w') as outfile:
        json.dump(insights, outfile, indent=4)

    print("\nGenerated Insights:")
    for insight in insights:
        print(insight)
