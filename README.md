
This is a application for Aha fullstack exam base on nextjs

## Getting Started
Clone from github (only for who has the permission)

```bash
git clone git@github.com:dennischen/aha-fullstack-exam.git --recursive
```

## Directory
 * /src : The source code
 * /cypress : The auto test code and data
 * /nextspace : Nextspace reference (submodule)

## Installation
 ```bash
yarn install
 ```

## Compile nextspace submodule
```bash
cd nextspace

#installation for submodule
yarn install

yarn dist
# or watch for running nextspace in nextjs dev
yarn dist-watch
```

## Run the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Auto test
Run the auto test by cypress test framework

```bash
yarn test
# or
yarn test:e2e

# or open and run manually
yarn test:e2e:open
```

## Production

```bash
# build
yarn build
# then
yarn start
# or just
yarn build-start
```

## Docker image
After build the procution (by yarn build), use docker to build a image and run application in a container

```bash
# docker image
docker build . -t aha-fullstack-exam
# run container
docker run -it -p 3000:3000 aha-fullstack-exam
```

## Oneline Application
Here is a online application at [https://case001.colaorange.net/home](https://case001.colaorange.net/home)