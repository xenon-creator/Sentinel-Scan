import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import plotly.express as px
import json

def generate_heatmap(data):
    df = pd.DataFrame(data)
    if "date_added" in df.columns:
        df['date'] = pd.to_datetime(df['date_added']).dt.date
    threat_by_date = df.groupby(['date', 'threat']).size().unstack(fill_value=0)
    plt.figure(figsize=(12, 8))
    sns.heatmap(threat_by_date, cmap="YlOrRd", annot=True, fmt="d")
    plt.title("Threat Frequency Heatmap")
    plt.xlabel("Threat Type")
    plt.ylabel("Date")
    plt.savefig("./data/threat_heatmap.png")
    plt.show()

def generate_bar_chart(threat_counts):
    df = pd.DataFrame(list(threat_counts.items()), columns=['Threat', 'Count'])
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Threat', y='Count', data=df, palette="viridis")
    plt.title("Threat Counts")
    plt.xlabel("Threat Type")
    plt.ylabel("Count")
    plt.xticks(rotation=45)
    plt.savefig("./data/threat_bar_chart.png")
    plt.show()

def generate_line_graph(data):
    df = pd.DataFrame(data)
    if "date_added" in df.columns:
        df['date'] = pd.to_datetime(df['date_added']).dt.date
    threat_trend = df.groupby('date').size().reset_index(name='count')
    fig = px.line(threat_trend, x='date', y='count', title="Threat Trends Over Time")
    fig.update_xaxes(title="Date")
    fig.update_yaxes(title="Threat Count")
    fig.write_html("./data/threat_line_graph.html")
    fig.show()

if __name__ == "__main__":
    with open("./data/aggregated_data.json", "r") as infile:
        data = json.load(infile)
    with open("./data/threat_counts.json", "r") as infile:
        threat_counts = json.load(infile)
    generate_heatmap(data)
    generate_bar_chart(threat_counts)
    generate_line_graph(data)