import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle

# ============================================================
# EDUTRACK AI — ML Training Script
# Dataset: xAPI Educational Mining Dataset (Kaggle)
# Adapted for EduTrack AI grading system
# ============================================================

# Load dataset
df = pd.read_csv('xAPI-Edu-Data.csv')

print(f'✅ Dataset loaded: {len(df)} records')
print(f'Columns: {df.columns.tolist()}')

# ============================================================
# PREPROCESSING
# ============================================================

# Convert StudentAbsenceDays to numeric
df['absence_numeric'] = df['StudentAbsenceDays'].apply(
    lambda x: 1 if x == 'Above-7' else 0
)

# Calculate attendance score from absence
df['attendance'] = df['StudentAbsenceDays'].apply(
    lambda x: np.random.uniform(50, 70) if x == 'Above-7'
    else np.random.uniform(75, 100)
)

# Normalize engagement features to 0-100 scale
df['participation'] = (df['raisedhands'] / df['raisedhands'].max() * 100).round(1)
df['resources'] = (df['VisITedResources'] / df['VisITedResources'].max() * 100).round(1)
df['announcements'] = (df['AnnouncementsView'] / df['AnnouncementsView'].max() * 100).round(1)
df['discussion'] = (df['Discussion'] / df['Discussion'].max() * 100).round(1)

# Calculate average score based on engagement metrics
df['avg_score'] = (
    df['participation'] * 0.3 +
    df['resources'] * 0.3 +
    df['announcements'] * 0.2 +
    df['discussion'] * 0.2
).round(1)

# Add realistic noise
np.random.seed(42)
df['avg_score'] = (df['avg_score'] + np.random.normal(0, 5, len(df))).clip(0, 100).round(1)

# Your school's GPA scale
def score_to_gpa(score):
    if score >= 80: return 4.0
    elif score >= 70: return 3.5
    elif score >= 60: return 3.0
    elif score >= 55: return 2.5
    elif score >= 50: return 2.0
    elif score >= 45: return 1.5
    elif score >= 40: return 1.0
    else: return 0.0

df['gpa'] = df['avg_score'].apply(score_to_gpa)
df['gpa'] = (df['gpa'] + np.random.normal(0, 0.1, len(df))).clip(0, 4.0).round(2)

# Map Class to risk level
# Dataset uses L=Low, M=Medium, H=High performance
def class_to_risk(c):
    if c == 'H': return 'Low'
    elif c == 'M': return 'Medium'
    else: return 'High'

df['risk_level'] = df['Class'].apply(class_to_risk)

# Credit hours (fixed for your courses)
df['total_credit_hours'] = 20

print(f'\n📊 Dataset Summary:')
print(f'Average score: {df["avg_score"].mean():.1f}')
print(f'Average GPA: {df["gpa"].mean():.2f}')
print(f'Average attendance: {df["attendance"].mean():.1f}%')
print(f'\nRisk Distribution:')
print(df['risk_level'].value_counts())

# Save processed dataset as CSV
df[[
    'avg_score', 'attendance', 'participation',
    'resources', 'gpa', 'risk_level'
]].to_csv('processed_dataset.csv', index=False)
print('\n✅ Processed dataset saved: processed_dataset.csv')

# ============================================================
# TRAIN ML MODELS
# ============================================================

features = ['avg_score', 'attendance', 'participation', 'resources', 'total_credit_hours']
X = df[features]

# --- TRAIN GPA REGRESSOR ---
y_gpa = df['gpa']
X_train, X_test, y_train, y_test = train_test_split(
    X, y_gpa, test_size=0.2, random_state=42
)

gpa_model = RandomForestRegressor(n_estimators=100, random_state=42)
gpa_model.fit(X_train, y_train)
gpa_score = gpa_model.score(X_test, y_test)
print(f'\n✅ GPA Model R² Score: {gpa_score:.2f}')

# --- TRAIN RISK CLASSIFIER ---
y_risk = df['risk_level']
le = LabelEncoder()
y_risk_encoded = le.fit_transform(y_risk)

X_train2, X_test2, y_train2, y_test2 = train_test_split(
    X, y_risk_encoded, test_size=0.2, random_state=42
)

risk_model = RandomForestClassifier(n_estimators=100, random_state=42)
risk_model.fit(X_train2, y_train2)
risk_score = risk_model.score(X_test2, y_test2)
print(f'✅ Risk Model Accuracy: {risk_score:.2f}')

# --- SAVE MODELS ---
with open('gpa_model.pkl', 'wb') as f:
    pickle.dump(gpa_model, f)

with open('risk_model.pkl', 'wb') as f:
    pickle.dump(risk_model, f)

with open('label_encoder.pkl', 'wb') as f:
    pickle.dump(le, f)

# Save feature names for reference
with open('features.pkl', 'wb') as f:
    pickle.dump(features, f)

print('\n✅ All models saved successfully!')
print(f'Risk Classes: {le.classes_}')
print('\nModel files created:')
print('  - gpa_model.pkl')
print('  - risk_model.pkl')
print('  - label_encoder.pkl')
print('  - features.pkl')