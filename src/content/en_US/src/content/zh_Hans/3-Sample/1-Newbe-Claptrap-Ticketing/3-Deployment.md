---
title: 'Deployment'
metaTitle: 'Train ticketing system - deployment'
metaDescription: 'Train ticketing system - deployment'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

## It is Online

The sample has already been deployed on the <http://ticketing.newbe.pro> website.

### Limited-time opening (still on file)

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

1. Make sure that the docker environment is properly installed locally and that the docker-compose/git is available.
2. Check out the project source <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Run the docker-compose build command in the src/Newbe.Claptrap.Ticketing folder to complete project compilation.
4. Run the docker-compose up-d in the src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite folder to start all services.
5. Access the `http://localhost:10080` to open the interface.

To sum up, the script is as follows：

```bash
Git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.examples/src/newbe.Claptrap.ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d.
```

The above steps are a way to run the SQLite database, and the code base contains several other deployment modes that require running up.cmd in different folders to：

| Folder.                | Description.                                   |
| ---------------------- | ---------------------------------------------- |
| Local Cluster Mongodb. | MongoDb multi-node load balancing version.     |
| LocalCluster SQLite.   | SQLite single-node version.                    |
| Tencent.               | The version deployed in the Online Experience. |

> - If you are currently Chinese mainland and are experiencing slow download of the netcore image, try using[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Developers can also choose to deploy the test[the PWD](https://labs.play-with-docker.com/).
> - Switch between different deployment modes, be careful to run docker-compose down first to close the last deployment.
> - Web ports may vary from deployment pattern to deployment mode, depending on the settings in docker-compose.yml.
