import streamlit as st
import yfinance as yf
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import joblib
import plotly.graph_objs as go
import matplotlib.pyplot as plt
# --- Load the saved model and scaler ---
model = load_model('lstm_model.h5', compile=False)
scaler = joblib.load('scaler.gz')

st.title("Gold Price Inflation/Deflation Predictor 🪙")
# --- Historical Dashboard Section ---
st.header("Historical Price Dashboard 📈")

time_period = st.selectbox(
    "Select a time period:",
    ("1 Week", "15 Days", "1 Month", "3 Months", "1 Year", "5 Years")
)
# Calculate start and end dates based on selection
end_date = pd.Timestamp.now()
if time_period == "1 Week":
    start_date = end_date - pd.DateOffset(weeks=1)
elif time_period == "15 Days":
    start_date = end_date - pd.DateOffset(days=15)
elif time_period == "1 Month":
    start_date = end_date - pd.DateOffset(months=1)
elif time_period == "3 Months":
    start_date = end_date - pd.DateOffset(months=3)
elif time_period == "1 Year":
    start_date = end_date - pd.DateOffset(years=1)
else: # 5 Years
    start_date = end_date - pd.DateOffset(years=5)

# Fetch and plot the data
historical_data = yf.download("GC=F", start=start_date, end=end_date)

fig_hist, ax_hist = plt.subplots(figsize=(12, 7))
ax_hist.plot(historical_data.index, historical_data['Close'])
ax_hist.set_title(f"Gold Price History - Last {time_period}")
ax_hist.set_xlabel("Date")
ax_hist.set_ylabel("Price (USD per troy ounce)")
ax_hist.grid(True)

st.pyplot(fig_hist)

# Add a horizontal line for separation
st.markdown("---")
# --- End of Section ---

st.write("""
This application predicts the future price of gold for the next 30 days using a trained LSTM neural network.
Click the button below to generate the forecast.
""")
# --- Forecast Period Selection ---
forecast_period_str = st.selectbox(
    "Select a forecast period:",
    ("30 Days", "3 Months", "1 Year", "5 Years")
)
# Convert the selected string to a number of days
if forecast_period_str == "30 Days":
    forecast_days = 30
elif forecast_period_str == "3 Months":
    forecast_days = 90
elif forecast_period_str == "1 Year":
    forecast_days = 365
else: # 5 Years
    forecast_days = 1825
# --- End of Section ---

if st.button("Predict Future Gold Prices"):
    with st.spinner('Fetching data and making predictions...'):
        # Fetch the last 60 days of data to feed the model
        end_date = pd.Timestamp.now()
        start_date = end_date - pd.DateOffset(days=90) # Fetch more to ensure we have 60 trading days
        gold_data = yf.download("GC=F", start=start_date, end=end_date)
        
        last_60_days = gold_data['Close'].values[-60:]
        last_60_days_scaled = scaler.transform(last_60_days.reshape(-1, 1))

        # --- Generate predictions for the selected number of days ---
        future_predictions = []
        current_sequence = last_60_days_scaled.reshape(1, 60, 1)

        for _ in range(forecast_days): # <-- Updated loop
            next_pred_scaled = model.predict(current_sequence)
            future_predictions.append(next_pred_scaled[0, 0])
            # Update the sequence
            new_sequence = np.append(current_sequence[0, 1:, 0], next_pred_scaled)
            current_sequence = new_sequence.reshape(1, 60, 1)

        # --- Inverse scale the predictions and create dates ---
        predictions = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))
        
        prediction_dates = pd.to_datetime([end_date + pd.DateOffset(days=i) for i in range(1, forecast_days + 1)])
        prediction_df = pd.DataFrame(
            predictions, 
            index=prediction_dates, 
            columns=['Predicted Price (USD per troy ounce)']
        )

        # --- Display the results ---
        st.subheader(f"{forecast_period_str} Gold Price Forecast")
        
        fig, ax = plt.subplots(figsize=(12, 7))
        ax.plot(gold_data.index, gold_data['Close'], label='Historical Price')
        ax.plot(prediction_df.index, prediction_df.values, label='Forecasted Price', linestyle='--')
        ax.set_title('Gold Price Forecast')
        ax.set_xlabel('Date')
        ax.set_ylabel('Price (USD per troy ounce)')
        ax.legend()
        ax.grid(True)
        st.pyplot(fig)
        
        st.write(f"Predicted Prices (next {forecast_period_str}):")
        st.dataframe(prediction_df)
