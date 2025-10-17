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
        close
        
