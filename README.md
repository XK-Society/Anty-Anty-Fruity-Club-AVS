# Anty anty fruity club AVS Oracle

This repository demonstrates how to implement a multi-cryptocurrency price oracle AVS (Actively Validated Service) using the Othentic Stack.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Usage](#usage)

---

## Overview
The Multi-Cryptocurrency Price Oracle AVS Example demonstrates how to deploy a minimal AVS using Othentic Stack that provides cryptocurrency price data and volatility-based fee calculations.

### Features

- **DefiDive API Integration:** Fetches real-time price data for various cryptocurrencies using the DefiDive API
- **Multi-Cryptocurrency Support:** Configurable to support any cryptocurrency available through the DefiDive API
- **Dynamic Fee Calculation:** Calculates trading fees based on market volatility
- **IPFS Data Storage:** Stores validated price data on IPFS via Pinata
- **Containerized deployment:** Simplifies deployment and scaling
- **Prometheus and Grafana integration:** Enables real-time monitoring and observability

## Project Structure

```mdx
📂 simple-price-oracle-avs-example
├── 📂 Execution_Service         # Implements Fee Generation logic - Express JS Backend
│   ├── 📂 config/
│   │   └── app.config.js        # An Express.js app setup with dotenv, and a task controller route for handling `/task` endpoints
│   ├── 📂 src/
│   │   └── dal.service.js       # A module that interacts with Pinata for IPFS uploads
│   │   ├── oracle.service.js    # A utility module to fetch the volatility of cryptocurrencies from the DefiDive API
│   │   ├── task.controller.js   # Implements periodic task execution for fee calculation and IPFS storage
│   │   ├── 📂 utils             # Defines two custom classes, CustomResponse and CustomError, for standardizing API responses
│   ├── Dockerfile               # A Dockerfile that sets up a Node.js (22.6) environment, exposes port 8080, and runs the application via index.js
|   ├── index.js                 # A Node.js server entry point that initializes the DAL service, loads the app configuration, and starts the server on the specified port
│   └── package.json             # Node.js dependencies and scripts
│
├── 📂 Validation_Service         # Implements task validation logic - Express JS Backend
│   ├── 📂 config/
│   │   └── app.config.js         # An Express.js app setup with a task controller route for handling `/task` endpoints
│   ├── 📂 src/
│   │   └── dal.service.js        # A module that interacts with Pinata for IPFS uploads
│   │   ├── oracle.service.js     # A utility module to fetch the current volatility of cryptocurrencies from the DefiDive API
│   │   ├── task.controller.js    # An Express.js router handling a `/validate` POST endpoint
│   │   ├── validator.service.js  # A validation module that checks if a task result from IPFS matches the current price within a 5% margin
│   │   ├── 📂 utils              # Defines two custom classes, CustomResponse and CustomError, for standardizing API responses
│   ├── Dockerfile                # A Dockerfile that sets up a Node.js (22.6) environment, exposes port 8080, and runs the application via index.js
|   ├── index.js                  # A Node.js server entry point that initializes the DAL service, loads the app configuration, and starts the server on the specified port
│   └── package.json              # Node.js dependencies and scripts
│
├── 📂 grafana                    # Grafana monitoring configuration
├── docker-compose.yml            # Docker setup for Operator Nodes (Performer, Attesters, Aggregator), Execution Service, Validation Service, and monitoring tools
├── .env.example                  # An example .env file containing configuration details and contract addresses
├── README.md                     # Project documentation
└── prometheus.yaml               # Prometheus configuration for logs
```

## Architecture

![Price oracle sample](https://github.com/user-attachments/assets/03d544eb-d9c3-44a7-9712-531220c94f7e)

The Performer node executes tasks using the Task Execution Service and sends the results to the p2p network.

Attester Nodes validate task execution through the Validation Service. Based on the Validation Service's response, attesters sign the tasks. In this AVS:

Task Execution logic:
- Fetch cryptocurrency price and volatility data from DefiDive API
- Calculate trading fees based on market volatility
- Store the result in IPFS
- Share the IPFS CID as proof

Validation Service logic:
- Retrieve the fee from IPFS using the CID
- Get the expected price data from DefiDive API
- Calculate the expected fee
- Validate by comparing the actual and expected fees within a 5% margin

## Fee Calculation Logic

The system calculates trading fees based on market volatility using the following formula:
```
fee = 2 * (volatility/volatilityThreshold)² + baseFee
```

Where:
- `baseFee`: 3.5 (minimum fee)
- `maxFee`: 5.5 (maximum fee)
- `volatilityThreshold`: 0.60 (60%)

This ensures fees scale dynamically with market conditions while staying within reasonable bounds.

---

## Prerequisites

- Node.js (v 22.6.0)
- Foundry
- [Yarn](https://yarnpkg.com/)
- [Docker](https://docs.docker.com/engine/install/)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Othentic-Labs/simple-price-oracle-avs-example.git
   cd simple-price-oracle-avs-example
   ```

2. Install Othentic CLI:

   ```bash
   npm i -g @othentic/othentic-cli
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration details
   # Add DEFAULT_COIN=eth (or another cryptocurrency symbol) to specify the default coin
   ```

## Usage

Follow the steps in the official documentation's [Quickstart](https://docs.othentic.xyz/main/avs-framework/quick-start#steps) Guide for setup and deployment.

### API Endpoints

- **Validation Service**: `/task/validate` (POST)
  - Required body parameter: `proofOfTask` (IPFS CID)
  - Optional body parameter: `coin` (cryptocurrency symbol, defaults to "eth")

### Configuring Cryptocurrencies

The system is configured to use Ethereum (ETH) by default, but you can modify it to use any cryptocurrency supported by the DefiDive API:

1. Set the `DEFAULT_COIN` environment variable to your preferred cryptocurrency symbol (e.g., "btc", "sol", "ada").
2. The system will automatically use that cryptocurrency for price fetching and fee calculations.

### Example Results
```bash
curl -X POST http://localhost:4003/task/execute
```

```bash
Server started on port: 4002
Validate task: proof of task: QmdV3JK7fnJx5ZUt9ut3795DDtptUMNAiJM3GhRY3jNBhb, coin: eth
Fetched Volatility for eth: 0.045647799999999995
Calculated Fee for eth: 3.5115762313602223
Validation for eth: Result=Approved, Bounds: [3.3360-3.6872], Got: 3.5116
Vote: Approve
```

### Next Steps
- Add more sophisticated fee calculation algorithms
- Implement batch processing for multiple cryptocurrencies
- Create a dashboard for visualizing fee trends
- Deploy on cloud platforms for wider availability
