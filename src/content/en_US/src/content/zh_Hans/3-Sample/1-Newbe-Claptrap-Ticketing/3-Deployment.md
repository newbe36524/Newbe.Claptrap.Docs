---
title: 'Deployment.'
metaTitle: 'Train ticketing system - deployment.'
metaDescription: 'Train ticketing system - deployment.'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

## Online experience.

This sample has been deployed on the <http://ticketing.newbe.pro> website.

### Open for a limited time.

Due to operating costs, the system is only available for the following specific periods：

| Date.    | Time.        |
| -------- | ------------ |
| Days.    | 12:00-14:00。 |
| Days.    | 20:00-22:00。 |
| Weekend. | 19:00-23:00。 |

Each time it reopens, the system will be reset and all data from the last opening will be emptied.

#### Swagger documentation.

To be more effective at ticketing, developers can develop automatic ticketing tools based on the APIs given in the swagger documentation.Document address<http://ticketing.newbe.pro/swagger>

## Deploy independently.

Developers can also use the source code for independent deployment in the local docker environment.Just follow the steps below.

1. Make sure that the docker environment is properly installed locally and that the docker-compose is available.
2. Check out the project source <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Run the `docker-compose build` command in the `src/Newbe.Claptrap.Ticketing` folder to complete project compilation.
4. Run `docker-compose up -d` in the`src/Newbe.Claptrap.Ticketing/LocalCluster` folder to start all services.
5. Access the `http://localhost:10080` to open the interface.

> If you are currently Chinese mainland and are experiencing slow download of the netcore image, try using[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
