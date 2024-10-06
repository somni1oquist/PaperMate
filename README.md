# Introduction

The Western Australian Centre for Road Safety Research (WACRSR) is initiating a project to automate the manual process of scanning and analyzing road safety literature. Currently, this process is labor-intensive, taking up valuable time that could be better spent on critical research tasks. To address this, the project aims to develop a system that leverages advanced large language models (LLMs) to streamline literature scanning and evaluation.

## Group Members

| Student ID | Full Name        | GitHub Username |
| ---------- | ---------------- | --------------- |
| 23856227   | Ziqi Chen        | ziqichen55555   |
| 24139368   | Krish Goti       | krishgoti2002   |
| 23740534   | Chung Hei Tse    | maxtse25        |
| 23926903   | Shijun Shao      | Halffancyy      |
| 23799876   | Hui-Ling Huang   | somni1oquist    |
| 23689789   | Nitish Raguraman | nitishragu12    |

## Project Structure
```
./
├── api/
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── __init__.py
│   ├── logs/
│   ├── config.py
│   ├── Dockerfile.<env>
│   ├── README.md
│   └── requirements.txt
├── secrets/
│   ├── els_api_key.txt
│   ├── els_token.txt
│   └── llm_api_key.txt
├── ui/
│   ├── app/
│   │   ├── about/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── home/
│   │   ├── results/
│   │   ├── search/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── ...
│   ├── public/
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── Dockerfile.<env>
│   ├── next-env.d.ts
│   ├── next.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
├── .gitignore
├── docker-compose.<env>.yml
└── README.md
```

## Launch Papermate Application

### 0: Install Docker Desktop
Go to [Docker](https://www.docker.com/products/docker-desktop/) website to download and install the application. Once Installed, make sure the docker engine is running.

### 1. Secrets
Contact developers to acquire the necessary three secret files: API key for Gemini, API key for Elsevier and Institutional token.
After getting the files, create a folder named `secrets/` under root folder:
```
├── secrets/
│   ├── els_api_key.txt
│   ├── els_token.txt
│   └── llm_api_key.txt
```
### 1.5. (Optional) Create `launch.json`
If you would like to use vscode debugger function, add the following content to cofiguration file `launch.json`:
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Remote Attach",
            "type": "debugpy",
            "request": "attach",
            "connect": {
                "host": "127.0.0.1",
                "port": 5678
            },
            "pathMappings": [
                {
                    "localRoot": "${workspaceFolder}/api",
                    "remoteRoot": "/app"
                }
            ],
            "justMyCode": true
        }
    ]
}
```

### 2. Run `docker-compose`

Open the terminal that is under root foler, choose an environment:
- For normal usage, enter `docker compose up --build`
- For debugger with `launch.json`, enter `docker compose -f docker-compose.debug.yml`
- For running test environment, enter `docker compose -f docker-compose.test.yml up --build`

### 3. Access Papermate
Go to the url of Papermate `http://localhost:3000/`, the app should be up and running now.

## User Manual
### 0. User Interface: 
Before you dive into the platform, familiarize yourself with its layout and functionalities. The webpage is divided into four main sections: **Home**, **Search**, **Result**, and **About**. 

#### [1] Home 
The Home page provides a brief introduction to the platform and its key functionalities. 

#### [2] Search (Literature Paper Search) picture will be provided after ui done 

The Search page is where you can query the database for relevant academic papers. 

#### [3] Result picture will be provided after ui done 

The Result page displays the search results only after you click Proceed on the 		Search page. 

#### [4] About  

The About page provides details about our development team and links to the GitHub repository for project updates and contributions. 

### 1. Operation Steps: 
In the search page: 

- Enter a Query (compulsory): Input keywords or phrases into the query field to search for specific topics or papers. 

- Enter Date Range (optional): Specify the time frame for the search by selecting "From Date" and "To Date." 

- Enter Title and Author (optional): Provide specific titles or authors to narrow down the search results. 

- Click Upload Publication CSV (optional): Upload a CSV file containing additional search parameters. 

- Click Gemini 1.5 Pro Option (optional): Users can enable or disable the Gemini Pro model for enhanced search capabilities. 

- Click Search Button: Click the "Search" button to initiate the query. 

- Click Proceed Button: After reviewing the results count, click the "Proceed" button to view detailed results on the Result page. 

In the Result page  

- After you click Proceed on the Search page (weather you have clicked search button or not): 

- View Results: Check the list of academic papers returned by the search, which includes details like DOI, title, abstract, author, publication, publish date, URL, relevance, and synopsis. 

- Click Columns: You can customize which columns to display, including additional categories like "Study Type" using the Show Instruction Box. 

- Click Filter, Density or Export: Utilize options to filter items, change page density, and export results as CSV files for further analysis. 

- Click Pagination: Navigate through the results using pagination controls, allowing users to view additional items if the results exceed the displayed limit. 

- Adjust Column Widths: Users can customize the appearance of the results table by adjusting column widths. 

- Click Show Instruction Box: 

- Add categories to your search results (e.g., type "add Study Type" to create a new column). 

- Hover to see the time and click to see the detailed instructions that you typed. 

### 2. FAQ: 
#### [1] Image Conflict: 
If you encounter issue during building images, you can clear the Docker cache by using the following command: 
```
docker system prune –a 
```
#### [2] Search and Proceed Functions:
Please be patient, as the search or proceed functions may take some time to complete. 

 
