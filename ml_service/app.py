from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

with open('gpa_model.pkl', 'rb') as f:
    gpa_model = pickle.load(f)

with open('risk_model.pkl', 'rb') as f:
    risk_model = pickle.load(f)

with open('label_encoder.pkl', 'rb') as f:
    le = pickle.load(f)

print('Models loaded successfully!')

FEATURE_NAMES = ['avg_score', 'attendance', 'participation', 'resources', 'total_credit_hours']


def score_to_gpa(score):
    if score >= 80:
        return 4.0
    elif score >= 70:
        return 3.5
    elif score >= 60:
        return 3.0
    elif score >= 55:
        return 2.5
    elif score >= 50:
        return 2.0
    elif score >= 45:
        return 1.5
    elif score >= 40:
        return 1.0
    else:
        return 0.0


def get_risk_from_gpa(gpa):
    if gpa >= 3.0:
        return 'Low'
    elif gpa >= 2.0:
        return 'Medium'
    else:
        return 'High'


def get_recommendation(risk, gpa):
    if risk == 'Low':
        return 'You are performing excellently! Keep up the great work and maintain your study habits.'
    elif risk == 'Medium':
        return 'You are performing moderately. Consider improving your attendance and participation to boost your GPA.'
    else:
        if gpa == 0.0:
            return 'Your current scores indicate a failing GPA. You need to significantly improve your performance across all courses. Please seek immediate academic support.'
        return 'You are at high risk of poor performance. Please seek academic support and improve your study habits immediately.'


@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'EduTrack AI ML Service is running! '})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True, silent=True)

        if not data:
            return jsonify({'error': 'No data received'}), 400

        avg_score = float(data.get('avg_score') or 0)
        current_gpa = float(data.get('current_gpa') or 0)
        attendance = float(data.get('attendance') or 75)
        participation = float(data.get('participation') or 70)
        resources = float(data.get('resources') or 70)
        total_credit_hours = float(data.get('total_credit_hours') or 20)

        features_df = pd.DataFrame([[
            avg_score,
            attendance,
            participation,
            resources,
            total_credit_hours
        ]], columns=FEATURE_NAMES)

        # ML model GPA prediction
        model_gpa = gpa_model.predict(features_df)[0]
        model_gpa = round(float(model_gpa), 2)
        model_gpa = max(0.0, min(4.0, model_gpa))

        # Rule based GPA from avg score
        rule_gpa = score_to_gpa(avg_score)

        # Calculate predicted GPA
        if current_gpa > 0:
            # Predicted GPA stays close to current with tiny positive nudge
            predicted_gpa = round(current_gpa + 0.05, 2)
        else:
            predicted_gpa = round((rule_gpa * 0.6) + (model_gpa * 0.4), 2)

        predicted_gpa = max(0.0, min(4.0, predicted_gpa))

        # Risk level based on predicted GPA
        risk_level = get_risk_from_gpa(predicted_gpa)

        # Risk probabilities from classifier
        risk_proba = risk_model.predict_proba(features_df)[0]
        risk_classes = le.classes_
        risk_probabilities = {
            str(risk_classes[i]): round(float(risk_proba[i]) * 100, 1)
            for i in range(len(risk_classes))
        }

        recommendation = get_recommendation(risk_level, predicted_gpa)

        return jsonify({
            'predicted_gpa': predicted_gpa,
            'risk_level': risk_level,
            'risk_probabilities': risk_probabilities,
            'recommendation': recommendation,
            'input_summary': {
                'avg_score': avg_score,
                'current_gpa': current_gpa,
                'attendance': attendance,
                'participation': participation,
                'resources': resources,
                'total_credit_hours': total_credit_hours,
            }
        })

    except Exception as e:
        import traceback
        print('Prediction error:', traceback.format_exc())
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)