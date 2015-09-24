# Dockerized Videos API
Videos micro-service on Node.js. This micro-service for add and encoding videos.

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [Events](#events)
* [API](#api)
* [License](#license)

# Architecture
The application is a REST API service with database and messaging service (Bus) dependencies.

# Technologies
* Node.js
* MongoDB/Mongoose
* Express.js
* Passport.js
* Official nsqjs driver for NSQ messaging service

# Environment Variables
The service should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
MONGODB_CONNECTION | mongodb://mongo_host:mongo_port/videos | MongoDB connection string.
TOKEN_ACCESSSECRET | MDdDRDhBOD*** | Access token secret.
NSQD_ADDRESS | bus.yourdomain.com | A hostname or an IP address of the NSQD running instance.
NSQD_PORT | 4150 | A TCP port number of the NSQD running instance to publish events.
ENCODER_URI | http://[encoder_uri]/[api_upload_path] | Uri of [Shiva](https://github.com/clickberry/video-encoder) encoder for uploading video.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Send events

Topic | Message | Description
:-- | :-- | :--
upload-videos | [Video Dto](###Video-Dto) | Upload video.
delete-removes | {videoId: *videoId*} | Video ID.

# API
## DTO
### Video Dto
| Param   | Description |
|----------|-------------|
| id     | Video ID|
| userId     | Owner user ID|
| name     | Name of video|
| created     | Date of uploaded video|
| videos     | List of [Encoded videos](###Encodeded Video Dto)|
| screenshots     | List of [Encoded screenshots](###Encodeded Screenshot Dto)|

### Encodeded Video Dto
| Param   | Description |
|----------|-------------|
| contentType     | Content type such ass *video/mp4* or *video/webm*|
| uri     | Uri of encoding video|
| width     | Width of video frame|
| height     | Height of video frame |

### Encodeded Screenshot Dto
| Param   | Description |
|----------|-------------|
| contentType     | Content type such ass *video/mp4* or *video/webm*|
| uri     | Uri of encoding video|

## POST /upload
Adds comment to relation entity.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |
#### Body (multipart/form-data)
| Param    | Description |
|----------|-------------|
| name    | Name of video       |
| video    | Video file       |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 201                                                                |
| Body |  [Video Dto](###Video Dto)                                                             |
