# 🔌 Decksmith 40-Pin GPIO & Bus Allocation Guide

This guide details the standard 40-pin header bus allocations utilized by Decksmith's real-time hardware collision engine.

---

## 📌 Standard 40-Pin Header Pinout Matrix

| Pin # | Function / Name | Default Bus | Recommended Use Case |
| :--- | :--- | :--- | :--- |
| **1** | 3.3V Power | DC Rail | Sensor VCC (Max 50mA) |
| **2** | 5.0V Power | DC Rail | Main SBC Supply / Fan 5V |
| **3** | GPIO 2 (SDA) | **I2C1** | BME680, RTC DS3231, OLED Displays |
| **4** | 5.0V Power | DC Rail | Display Backlight / High-Draw HATs |
| **5** | GPIO 3 (SCL) | **I2C1** | I2C Clock Line (400kHz Fast Mode) |
| **6** | Ground | GND | Ground Return |
| **7** | GPIO 4 (GPCLK0) | GPIO | 1-Wire Temperature (DS18B20) |
| **8** | GPIO 14 (TXD) | **UART0** | GPS NMEA / Serial Console / Bluetooth |
| **9** | Ground | GND | Ground Return |
| **10**| GPIO 15 (RXD) | **UART0** | GPS NMEA / Serial Console |
| **11**| GPIO 17 | GPIO | LoRa SX1262 Reset Pin (RST) |
| **12**| GPIO 18 (PWM0) | **PWM** | Active Fan Speed Modulation (25kHz) |
| **19**| GPIO 10 (MOSI) | **SPI0** | Micro-SD / SPI Display / LoRa RF |
| **21**| GPIO 9 (MISO) | **SPI0** | Micro-SD / LoRa MISO Line |
| **23**| GPIO 11 (SCLK) | **SPI0** | SPI Clock (Up to 32MHz) |
| **24**| GPIO 8 (CE0) | **SPI0** | Primary SPI Chip Select (Display) |
| **26**| GPIO 7 (CE1) | **SPI0** | Secondary SPI Chip Select (LoRa RF) |

---

## ⚡ Bus Collision Rules
1. **I2C Address Conflicts**: Two devices on the same I2C bus (`I2C1`) cannot share the same 7-bit hex address (e.g. two BME680 sensors at `0x77`). Decksmith will flag this and suggest changing the ADDR jumper to `0x76`.
2. **SPI Chip Select (CS) Stacking**: You cannot attach both an e-Paper display and a LoRa radio to `SPI0 CE0 (Pin 24)`. Decksmith will auto-allocate the second module to `SPI0 CE1 (Pin 26)`.
3. **PWM Fan Control**: Pin 12 (GPIO 18) is hardware-timed PWM. Using software bit-banging on standard GPIO pins can cause audio jitter if using I2S soundcards simultaneously.
