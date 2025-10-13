import streamlit as st
import yfinance as yf
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import joblib
import plotly.graph_objs as go

# --- Load the saved model and scaler ---
model = load_model('lstm_model.h5', compile=False)
scaler = joblib.load('scaler.gz')

st.title("Gold Price Inflation/Deflation Predictor 🪙")

st.write("""
This application predicts the future price of gold for the next 30 days using a trained LSTM neural network.
Click the button below to generate the forecast.
""")

if st.button("Predict Future Gold Prices"):
    with st.spinner('Fetching data and making predictions...'):
        # --- Fetch the last 60 days of data to feed the model ---
        end_date = pd.Timestamp.now()
        start_date = end_date - pd.DateOffset(days=90) # Fetch more to ensure we have 60 trading days
        gold_data = yf.download("GC=F", start=start_date, end=end_date)
        
        last_60_days = gold_data['Close'].values[-60:]
        last_60_days_scaled = scaler.transform(last_60_days.reshape(-1, 1))

        # --- Generate predictions for the next 30 days ---
        future_predictions = []
        current_sequence = last_60_days_scaled.reshape(1, 60, 1)

        for _ in range(30):
            next_pred_scaled = model.predict(current_sequence)
            future_predictions.append(next_pred_scaled[0, 0])
            # Update the sequence
            new_sequence = np.append(current_sequence[0, 1:, 0], next_pred_scaled)
            current_sequence = new_sequence.reshape(1, 60, 1)

       # --- Inverse scale the predictions and create dates ---
        predictions = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))
        
        prediction_dates = pd.to_datetime([end_date + pd.DateOffset(days=i) for i in range(1, 31)])
        
        # --- FIX for Table Label ---
        prediction_df = pd.DataFrame(
            predictions, 
            index=prediction_dates, 
            columns=['Predicted Price (USD per troy ounce)']
        )

        # --- Display the results ---
        st.subheader("30-Day Gold Price Forecast")
        # --- Add this block for debugging ---
        st.subheader("Debugging Info")
        st.write("Data for Historical Plot:")
        st.dataframe(gold_data.tail())
        st.write("Data for Forecast Plot:")
        st.dataframe(prediction_df.head())
        # --- End of debugging block ---
        # Plotly chart
        fig = go.Figure()
        
        # --- FIX for Graph ---
        # Add historical data trace
        fig.add_trace(go.Scatter(
            x=gold_data.index, 
            y=gold_data['Close'], 
            mode='lines', 
            name='Historical Price'
        ))
        # Add forecasted data trace
        fig.add_trace(go.Scatter(
            x=prediction_df.index, 
            y=prediction_df['Predicted Price (USD per troy ounce)'].values, # Use .values to ensure plotting
            mode='lines', 
            name='Forecasted Price', 
            line=dict(dash='dash')
        ))
        
        # --- FIX for Chart Label ---
        fig.update_layout(
            title="Gold Price Forecast", 
            xaxis_title="Date", 
            yaxis_title="Price (USD per troy ounce)"
        )
        
        st.plotly_chart(fig)
        
        st.write("Predicted Prices (next 30 days):")
        st.dataframe(prediction_df)

