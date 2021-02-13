---
date: 2020-08-16
title: Young widower yo, are you dropping this free 8-core 4G public network server, or is this ready-to-use Docker experimental platform?
---

Children make choices, adults all want.So let's take a look at how to get a free 8-core 4G docker experimental platform server.

<!-- more -->

## Play With Docker

Open the<https://labs.play-with-docker.com/>to access the Play With Docker platform. Sign up for a DockerHub account and you can access this site and easily get an 8-core 4G public network server. Let's take a look at how to use this server for some Docker operations.

## Deploy Nginx

In this example, we deploy an nginx and expose the service to a public network address.

### Sign in and create an instance

This step is very simple, with little explanation, and once the successful creation is complete, you can see the interface shown below.

![The interface](/images/20200816-001.png)

### Pull the mirror

By running the following command, you can pull the latest nginx image.

```bash
docker pull nginx
```

Pull is very fast because this instance node is deployed abroad, so you can download it very quickly without setting up a mirror.

### Start the nginx container

By running the following command, you can start an nginx container

```bash
docker run --name nginx-test -p 8080:80 -d nginx
```

### Public access

Once the deployment is complete, a new button appears automatically on the interface to indicate that the public network address can now be deployed successfully, as shown in the：

![The button for public access](/images/20200816-002.png)

At the click of a button, you can access the nginx service in your browser that you have just deployed successfully.

If you generate a button, you can also click "OPEN PORT" to select an open port.

## Deploy a train ticketing system

Just deploying a simple nginx is obviously not fun enough.So I'm going to deploy a slightly more complex system.

This is a demonstration system consisting of seven containers, with reference to the instructions of[Train TicketIng System - Deployment](https://claptrap.newbe.pro/zh_Hans/3-Sample/1-Newbe-Claptrap-Ticketing/3-Deployment), and running the following command to start a simulated train ticketing system：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterMongodb
docker-compose up -d
```

Once the script is running, open port 10080 via OPEN PORT to view the train ticket simulation ticketing system that has just been deployed. ![Simulated ticketing system interface](/images/20200816-003.png)

<!-- md Footer-Newbe-Claptrap.md -->
