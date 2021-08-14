---
title: "Step 1 - Development environment preparation"
description: "Step 1 - Development environment preparation"
---

Newbe.Claptrap framework relies on some key foundation components and some optional components.In this article, we'll show you how to prepare a development environment.

<!-- more -->

## Required Components

These components are components that must be installed for development using this framework.

### Docker Desktop

Docker Desktop is the basis for all of the following components to run.Developer can download the version of the corresponding operating system and install:

<https://www.docker.com/products/docker-desktop>

Once installed, you can use the following commands in the console to verify:

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> docker --version
Docker version 20.10.2, build 2291f61
```

Chinese mainland users, you need to configure an mirror for Docker Desktop.This will contribute to the installation of the subsequent environment.

### dotnet SDK

This framework relies on the net 5 SDK and runtime.Developers can download the latest SDKs via the links below and follow the prompts to install：

<https://dotnet.microsoft.com/download/dotnet/5.0>

Once installed, you can use the following commands in the console to verify:

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> dotnet --version
5.0.103
```

### Tye

Tye is an auxiliary command-line tool developed by Microsoft to simplify distributed application development.

Developers can find the latest installation command-line scripts in the links below:

<https://www.nuget.org/packages/Microsoft.Tye>

Once installed, you can use the following commands in the console to verify:

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> tye --version
0.6.0-alpha.21070.5+a42e4463943e3136dbd1de38474d8d62b802797c
```

### Dapr

Dapr is the cornerstone of Newbe.Claptrap's operations.The following official documentation can be used to understand how the development environment is installed：

<https://docs.dapr.io/getting-started/>

Chinese users can also view the introduction to the Chinese link below：

<https://dapr-cn.gitee.io/getting-started/>

Once installed, you can use the following commands in the console to verify:

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> dapr --version
CLI version: 1.0.0
Runtime version: 1.0.0
```

### Databases

Newbe.Clatraptrap currently supports `SQLite`/`Mysql`/`PostgreSQL`/`Mongodb` databases.

Developers can select app instances that have already been deployed well, or they can get the`docker-compose.yml`files used when this project was developed via the following link to deploy the database:

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Docker/Database>

## Optional Components

These components are the optional components when using this framework for development.You only need to use specific features if you need to.However, we still recommend that developers install these components.This helps developers better understand how the system is working.

### Grafana

Grafana is a great open source solution for charting the monitoring data of the system.

Developers can create a Grafana instance for this project using the`docker-compose.yml`provided in the following link:

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Docker/Monitor>

### Jaeger

Jaeger is a distributed monitoring tool that can help developers learn more about the relationships and performance details between services.

The developer can run a Jaeger instance for this project by `docker-compose.yml` provided by following link:

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Newbe.Claptrap.Template/HelloClaptrap>

This`docker-compose.yml`file can also be found from the project template.A detailed introduction to the project template will be explained in the next section.

### Seq

Seq is a highly efficient distributed log management tool that can help developers collect and visualize the logs of multiple applications.

Developers can build a Seq instance for this project using the`docker-compose.yml`:

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Newbe.Claptrap.Template/HelloClaptrap>

This`docker-compose.yml`file can also be found from the project template.A detailed introduction to the project template will be explained in the next section.

## Summary

In this article, we get a first look at how to initialize a basic available development environment for the Newbe.Claptrap project.

Next, we'll use this environment and project templates to create the first Newbe.Claptrap project.
