# Dockerized Videos API
Videos encoding micro-service on Node.js. This micro-service is for add videos for encoding/transcoding.

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
SIGN_SECRET | MDdDRDhBOD*** | Sekret key for signing videos and screenshots URI-s.
PORT | 8080 | Container port.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Send events
Topic | Message | Description
:-- | :-- | :--
video-creates | [Video Dto](#video-dto) | Upload video.
video-deletes | {videoId: *videoId*, userId: *user_id*, size: *size_in_bytes*} | Deleted video.
video-storage-updates | [Storage Dto](#storage-dto) | Updated storage space.

# API
## DTO

### Video Dto
| Param   | Description |
|----------|-------------|
| id     | Video ID|
| userId     | Owner user ID|
| name     | Name of video|
| created     | Date of uploaded video|
| videos     | [Videos](#videos-dto)|
| screenshots     | List of [Encoded screenshots](#encodeded-screenshot-dto)|

### Videos Dto
| Param   | Description |
|----------|-------------|
| id     | Video id|
| encoded     |List of [Encoded videos](#encodeded-video-dto)|
| sign     | Signature of concat all encoded video uri and video ID with comma separated **(uri_mp4_360,uri_webm_360,video_id)**|

### Encodeded Video Dto
| Param   | Description |
|----------|-------------|
| contentType     | Content type such as *video/mp4* or *video/webm*|
| uri     | Uri of encoding video|
| width     | Width of video frame|
| height     | Height of video frame |

### Encodeded Screenshot Dto
| Param   | Description |
|----------|-------------|
| contentType     | Content type such as *video/mp4* or *video/webm*|
| uri     | Uri of encoding screenshot|
| sign     | Uri signature. **Only for Response**|

### Storage Dto
| Param   | Description |
|----------|-------------|
| userId     | Owner user ID|
| available     | Total available storage space |
| used     | Total used storage space |

## POST /?quality
Adds video for encoding with specific quantities. If quality param is set for ezample *?quality=S480,S720*, then video will send to encoder with this quality params.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Query Param
| Param    | Description |
|----------|-------------|
| quality    | String with [qualities](https://github.com/clickberry/video-encoder/wiki/Video%20Quality%20Enum) separated comma.        |

#### Body (multipart/form-data)
| Param    | Description |
|----------|-------------|
| name    | Name of video       |
| video    | Video file       |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 201                                                                |
| Body |  [Video Dto](#video-dto)                                                             |

## GET /
Get all user videos.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | List of [Video Dto](#video-dto)                                                             |

## GET /:videoId
Get user video by id.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | [Video Dto](#video-dto)                                                             |

## DELETE /:videoId
Remove user video by id.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |

## GET /storage/available
Get info about user video storage.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | [Storage Dto](#storage-dto) |

# License
Source code is under GNU GPL v3 [license](LICENSE).
