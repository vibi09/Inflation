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
# Use a try-except block to handle potential file not found errors
try:
    model = load_model('final_model.h5', compile=False)
    scaler_X = joblib.load('scaler_X.gz')
    scaler_y = joblib.load('scaler_y.gz')
except FileNotFoundError:
    st.error("Model or scaler files not found. Make sure 'final_model.h5', 'scaler_X.gz', and 'scaler_y.gz' are in the same folder as the app.")
    st.stop()

# --- App Title and Description ---
st.title("Gold Price Inflation/Deflation Predictor 🪙")
st.write("This application uses an LSTM neural network with macroeconomic indicators to forecast the price of gold.")

# --- Historical Dashboard Section ---
st.header("Historical Price Dashboard 📈")
time_period = st.selectbox(
    "Select a time period:",
    ("1 Week", "15 Days", "1 Month", "3 Months", "1 Year", "5 Years")
)

end_date_hist = pd.Timestamp.now()
if time_period == "1 Week":
    start_date_hist = end_date_hist - pd.DateOffset(weeks=1)
elif time_period == "15 Days":
    start_date_hist = end_date_hist - pd.DateOffset(days=15)
elif time_period == "1 Month":
    start_date_hist = end_date_hist - pd.DateOffset(months=1)
elif time_period == "3 Months":
    start_date_hist = end_date_hist - pd.DateOffset(months=3)
elif time_period == "1 Year":
    start_date_hist = end_date_hist - pd.DateOffset(years=1)
else: # 5 Years
    start_date_hist = end_date_hist - pd.DateOffset(years=5)

hist_data = yf.download("GC=F", start=start_date_hist, end=end_date_hist)
fig_hist, ax_hist = plt.subplots(figsize=(12, 7))
ax_hist.plot(hist_data.index, hist_data['Close'])
ax_hist.set_title(f"Gold Price History - Last {time_period}")
ax_hist.set_xlabel("Date")
ax_hist.set_ylabel("Price (USD per troy ounce)")
ax_hist.grid(True)
st.pyplot(fig_hist)

st.markdown("---")

# --- Forecast Section ---
st.header("Multivariate Price Forecast 🤖")
if st.button("Generate New Forecast"):
    with st.spinner('Running advanced forecast... This may take a moment.'):
        # 1. --- Data Sourcing ---
        tickers = ["GC=F", "DX-Y.NYB", "CL=F", "^GSPC", "^NSEI", "SI=F", "INR=X"]
        fred_codes = {'Inflation_CPI': 'CPIAUCSL', 'InterestRate': 'DFF'}
        
        end_date_pred = datetime.datetime.now()
        start_date_pred = end_date_pred - pd.DateOffset(months=6)

        market_data = yf.download(tickers, start=start_date_pred)
        economic_data = web.DataReader(list(fred_codes.values()), 'fred', start_date_pred, end_date_pred)
        economic_data.columns = list(fred_codes.keys())

        # 2. --- Data Unification ---
        close_prices = market_data['Close']
        master_df = pd.merge(close_prices, economic_data, left_index=True, right_index=True, how='left')
        master_df.fillna(method='ffill', inplace=True)
        master_df.dropna(inplace=True)

        # 3. --- Feature Engineering ---
        last_60_days = master_df.drop('GC=F', axis=1).values[-60:]
        last_60_days_scaled = scaler_X.transform(last_60_days)
        
        # 4. --- Prediction ---
        X_pred = last_60_days_scaled.reshape(1, 60, last_60_days_scaled.shape[1])
        prediction_scaled = model.predict(X_pred)
        prediction = scaler_y.inverse_transform(prediction_scaled)

        st.subheader(f"Predicted Gold Price for the next trading day:")
        st.metric(label="Price (USD per troy ounce)", value=f"${prediction[0][0]:,.2f}")
