import streamlit as st
import yfinance as yf
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import joblib
import matplotlib.pyplot as plt
import pandas_datareader.data as web
import datetime

# --- Load Model and Scalers ---
try:
    model = load_model('final_model.h5', compile=False)
    scaler_X = joblib.load('scaler_X.gz')
    scaler_y = joblib.load('scaler_y.gz')
except FileNotFoundError:
    st.error("Model or scaler files not found. Make sure 'final_model.h5', 'scaler_X.gz', and 'scaler_y.gz' are in the same folder as the app.")
    st.stop()

# --- App Title and Description ---
st.title("Gold Price Inflation/Deflation Predictor 🪙")
st.write("Click the button below to generate a 30-day forecast for the price of gold using a multivariate LSTM model.")

# --- Prediction Button and Logic ---
if st.button("Generate 30-Day Forecast"):
    with st.spinner('Running advanced forecast... This may take a moment.'):
        # 1. --- Data Sourcing ---
        tickers = ["GC=F", "DX-Y.NYB", "CL=F", "^GSPC", "^NSEI", "SI=F", "INR=X"]
        fred_codes = {'Inflation_CPI': 'CPIAUCSL', 'InterestRate': 'DFF'}
        
        end_date = datetime.datetime.now()
        start_date = end_date - pd.DateOffset(months=6)

        market_data = yf.download(tickers, start=start_date, end=end_date)
        economic_data = web.DataReader(list(fred_codes.values()), 'fred', start_date, end_date)
        economic_data.columns = list(fred_codes.keys())

        # 2. --- Data Unification ---
        close_prices = market_data['Close']
        master_df = pd.merge(close_prices, economic_data, left_index=True, right_index=True, how='left')
        master_df.fillna(method='ffill', inplace=True)
        master_df.dropna(inplace=True)

        # 3. --- Feature Engineering & Prediction ---
        last_60_days = master_df.drop('GC=F', axis=1).values[-60:]
        last_60_days_scaled = scaler_X.transform(last_60_days)
        
        future_predictions = []
        current_sequence = last_60_days_scaled.reshape(1, 60, last_60_days_scaled.shape[1])

        for _ in range(30): # Hardcoded 30-day forecast
            next_pred_scaled = model.predict(current_sequence)
            future_predictions.append(next_pred_scaled[0, 0])
            
            # Create a placeholder for the next day's features
            next_features_scaled = current_sequence[0, 1:, :]
            
            # Append the predicted price (as the new 'gold price' feature)
            # This is a simplification; a more advanced model would predict all features.
            # For now, we assume other features remain constant or follow a simple trend.
            # Here, we will just use the last known features for simplicity.
            last_known_features = current_sequence[0, -1, 1:]
            predicted_gold_price_scaled = next_pred_scaled[0,0]

            # Construct the next input step
            # This logic is complex; for a robust model, one would predict all features or use a simpler model.
            # Sticking to the last known features is a common simplification.
            new_step_features = np.insert(last_known_features, 0, predicted_gold_price_scaled)
            new_sequence_step = new_step_features.reshape(1, -1)
            
            # Append new step to sequence
            next_features_scaled = np.append(next_features_scaled, new_sequence_step, axis=0)
            current_sequence = next_features_scaled.reshape(1, 60, next_features_scaled.shape[1])


        # --- Inverse scale and display results ---
        predictions = scaler_y.inverse_transform(np.array(future_predictions).reshape(-1, 1))
        
        prediction_dates = pd.to_datetime([end_date + pd.DateOffset(days=i) for i in range(1, 31)])
        prediction_df = pd.DataFrame(
            predictions, 
            index=prediction_dates, 
            columns=['Predicted Price (USD per troy ounce)']
        )

        st.subheader("30-Day Gold Price Forecast")
        
        fig, ax = plt.subplots(figsize=(12, 7))
        historical_display = market_data['Close']['GC=F']
        ax.plot(historical_display.index, historical_display.values, label='Recent Historical Price')
        ax.plot(prediction_df.index, prediction_df.values, label='Forecasted Price', linestyle='--')
        ax.set_title('Gold Price Forecast')
        ax.set_xlabel('Date')
        ax.set_ylabel('Price (USD per troy ounce)')
        ax.legend()
        ax.grid(True)
        st.pyplot(fig)
        
        st.write("Predicted Prices (next 30 days):")
        st.dataframe(prediction_df)
