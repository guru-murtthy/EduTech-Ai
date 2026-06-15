import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import pickle
import os

# Grade classifier and Success Regressor
_classifier = None
_regressor = None

def train_model():
    global _classifier, _regressor
    print("Training Random Forest models for student performance prediction...")
    
    # Generate synthetic training data
    # Features: Avg Quiz Score (0-100), Course Completion % (0-100), Study Time (hours/week, 0-20)
    np.random.seed(42)
    n_samples = 500
    
    quiz_scores = np.random.uniform(40, 100, n_samples)
    completion = np.random.uniform(20, 100, n_samples)
    study_time = np.random.uniform(1, 20, n_samples)
    
    # Define success probability based on features with some noise
    # Success probability = 0.4 * quiz + 0.4 * completion + 0.2 * study_time + noise
    success_prob = (0.4 * (quiz_scores / 100.0) + 
                    0.4 * (completion / 100.0) + 
                    0.2 * (study_time / 20.0)) * 100.0
    success_prob = np.clip(success_prob + np.random.normal(0, 5, n_samples), 0, 100)
    
    # Determine grade and risk level based on success probability
    # A: >= 85, B: 70-85, C: 55-70, D: 40-55, F: < 40
    grades = []
    risk_levels = []
    
    for score in success_prob:
        if score >= 85:
            grades.append("A")
            risk_levels.append("Low")
        elif score >= 70:
            grades.append("B")
            risk_levels.append("Low")
        elif score >= 55:
            grades.append("C")
            risk_levels.append("Medium")
        elif score >= 40:
            grades.append("D")
            risk_levels.append("High")
        else:
            grades.append("F")
            risk_levels.append("High")
            
    df = pd.DataFrame({
        'quiz_score': quiz_scores,
        'completion': completion,
        'study_time': study_time,
        'success_prob': success_prob,
        'grade': grades,
        'risk_level': risk_levels
    })
    
    X = df[['quiz_score', 'completion', 'study_time']]
    
    # Multi-output classifier (grade and risk level)
    # We will encode them to target indices
    grade_mapping = {"A": 0, "B": 1, "C": 2, "D": 3, "F": 4}
    risk_mapping = {"Low": 0, "Medium": 1, "High": 2}
    
    y_grade = df['grade'].map(grade_mapping)
    y_risk = df['risk_level'].map(risk_mapping)
    
    # Train random forest classifier for grades
    clf_grade = RandomForestClassifier(n_estimators=50, random_state=42)
    clf_grade.fit(X, y_grade)
    
    # Train random forest classifier for risk
    clf_risk = RandomForestClassifier(n_estimators=50, random_state=42)
    clf_risk.fit(X, y_risk)
    
    # Train regressor for success probability
    reg_success = RandomForestRegressor(n_estimators=50, random_state=42)
    reg_success.fit(X, success_prob)
    
    _classifier = {
        'grade': clf_grade,
        'risk': clf_risk,
        'grade_inverse': {v: k for k, v in grade_mapping.items()},
        'risk_inverse': {v: k for k, v in risk_mapping.items()}
    }
    _regressor = reg_success
    
    print("Models trained successfully!")

def predict_performance(quiz_scores: list, completion_rate: float, study_time: float):
    global _classifier, _regressor
    if _classifier is None or _regressor is None:
        train_model()
        
    avg_quiz = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0.0
    
    features = pd.DataFrame([[avg_quiz, completion_rate, study_time]], 
                            columns=['quiz_score', 'completion', 'study_time'])
    
    pred_grade_idx = _classifier['grade'].predict(features)[0]
    pred_risk_idx = _classifier['risk'].predict(features)[0]
    pred_success_val = _regressor.predict(features)[0]
    
    return {
        "predicted_grade": _classifier['grade_inverse'][pred_grade_idx],
        "success_probability": round(float(pred_success_val), 1),
        "risk_level": _classifier['risk_inverse'][pred_risk_idx]
    }

# Initialize model training on import/start
train_model()
