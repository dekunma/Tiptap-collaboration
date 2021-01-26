# Tiptap-collaboration
**An online collaborating document app based on [tiptap](https://tiptap.dev/collaboration) .**  
**See a demo at [collaboration.dekun.me](https://collaboration.dekun.me/document/?id=02687733-c960-4b03-8f66-b416e8e116ee) .**  
**Notice:** the server hosting this demo application is located in Los Angeles, so latency would be unexpectedly high if you are visiting it in China.

## Frameworks
- vue.js
- Express.js
- Socket.io
- Redis

## Usage
1. Click "New document" to create a new collaborating document   
![new-collaboration.png](https://i.loli.net/2021/01/26/fYTLiUvhHQzmRVI.png)

<br/>
<bnr/>

2. In the new document, try typing or editing something.  
    Other users in the same document can see the changes simultaneously.
    ![main.png](https://i.loli.net/2021/01/26/l1mACur5QpoORHy.png)

## Quick start - Development
This project uses [nodejs](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/) as the package manager.  
Make sure you have these installed before moving on to the next steps.

### server side:
1. ```cd``` into ```server``` directory.

2. do:
    ```
    yarn
    ```
    in the directory to install dependencies.

3. install [Redis](https://redis.io/) on your machine.

4. Start Redis after installing.  
    Typically, you can use
    ```
    redis-server &
    ```
    to start redis in the background.
    ![redis.png](https://i.loli.net/2021/01/26/GTpjQfu8W1rn7UV.png)
    By default, Redis will start on port ```6379``` without no username or password required.

5. Back to the ```server``` directory.  
    If you did not start redis on your local machine or changed the port of redis, go to ```server/.env```   
    and change the ```REDIS_PORT``` and ```REDIS_END_POINT``` accordingly.  
    Otherwise, ignore this step and move on.

6. In the ```server``` directory, do
    ```
    yarn start
    ```
    If your shell / terminal prints out:
    ```
    $ node app
    Server running on port 5000
    Connected to Redis
    ```
    it means you have configured and started the server side correctly.


### client side:
1. ```cd``` into ```client``` directory

2. Open ```client/src/environment.config.js```  
    This is the environment config file.  
    If you followed the above steps to configure the backend, then change the value  of ```SERVER_ADDRESS``` to ```http://localhost:5000``` .  
    Otherwise, change it to the address where your server is.

2. do:
    ```
    yarn
    ```
    in the ```client``` directory to install dependencies.

3. After installing the dependencies, do
    ``` 
    yarn server
    ```
    to start the application.
4. the application will start on ```http://localhost:8080``` by default

## Build
### client side
1. ```cd``` into ```client```

2. do
    ```
    yarn build
    ```

3. The compiled html / css / js file will be located in ``dist`` directory. 

## Bugs to be fixed
| Bugs | Fix Status |
| - | - |
| Cannot insert ```lists``` or ```blockquotes```. Tiptap collaboration does not support these. | ❌ |
| User count will increase after refresh. Perhaps due to high internet latency, | ❌ |

## Acknowledgement  
This app uses backend code from [tiptap-collaboration-server-side](https://glitch.com/edit/#!/tiptap-sockets) .  
And editor [styles](https://github.com/ueberdosis/tiptap/blob/main/examples/assets/sass/editor.scss) created by tiptap.

## Licensing  
This project is licensed under **MIT**.  
It means that you can do anyting to our code, except that you must include copyright notice and permission notice in all copies or substantial portions of your software.  

## Contact  
**If you encountered any technical difficulties (or bugs) when using our app, please contact me with the following information:**  
- Email: William@dekun.me  
- WeChat: Magnoliae_Flos 
