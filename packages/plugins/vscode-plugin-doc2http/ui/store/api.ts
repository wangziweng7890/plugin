import { writable } from 'svelte/store'

export const apiData = writable({
  "tags": [
    "chatbot管理后台/机器人意图库"
  ],
  "customApiFields": {},
  "status": "developing",
  "requestBody": {
    "type": "application/x-www-form-urlencoded",
    "example": '',
    "parameters": [
      {
        "id": "zQmCaGoCdb",
        "name": "ids[]",
        "required": true,
        "description": "ids必须是数组",
        "example": [
          "1",
          "2"
        ],
        "type": "array"
      },
      {
        "id": "bhC0aaE6vb",
        "name": "bot_id",
        "required": true,
        "description": "机器人id必填",
        "example": "1",
        "type": "number"
      },
      {
        "id": "javXdj0LMW",
        "name": "state",
        "required": true,
        "description": "状态必须是数字，只能是：0或1",
        "example": "0",
        "type": "number"
      }
    ]
  },
  "parameters": {
    "path": [],
    "query": [],
    "cookie": [],
    "header": [
      {
        "id": "gqKa8MCvxG",
        "name": "app",
        "required": false,
        "description": "",
        "example": "{{app}}",
        "type": "string"
      },
      {
        "id": "KSuZKeB1Qd",
        "name": "token",
        "required": false,
        "description": "",
        "example": "{{token}}",
        "type": "string"
      },
      {
        "id": "QhuSO8IWYN",
        "name": "Token",
        "required": true,
        "description": "",
        "example": "{{TOKEN}}",
        "type": "string"
      }
    ]
  },
  "commonParameters": {},
  "auth": {},
  "commonResponseStatus": {},
  "advancedSettings": {},
  "mockScript": {},
  "preProcessors": [],
  "postProcessors": [],
  "inheritPreProcessors": {},
  "inheritPostProcessors": {},
  "id": 75343802,
  "name": "批量修改状态",
  "type": "http",
  "serverId": "",
  "description": "",
  "operationId": "",
  "sourceUrl": "",
  "method": "put",
  "path": "/chatbot-admin/bot-intent/batch-edit-state",
  "projectId": 2581365,
  "folderId": 15020289,
  "ordering": 18,
  "creatorId": 1537800,
  "editorId": 1547498,
  "responsibleId": 0,
  "createdAt": "2023-04-14T07:47:08.000Z",
  "updatedAt": "2023-06-01T11:45:28.000Z",
  "deletedAt": null,
  "responses": [
    {
      "jsonSchema": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer"
          },
          "message": {
            "type": "string"
          },
          "data": {
            "type": "boolean"
          }
        },
        "required": [
          "code",
          "message",
          "data"
        ],
        "x-apifox-orders": [
          "code",
          "message",
          "data"
        ]
      },
      "defaultEnable": true,
      "id": 190687404,
      "name": "成功",
      "apiDetailId": 75343802,
      "projectId": 0,
      "code": 200,
      "contentType": "json",
      "ordering": 1,
      "folderId": 0,
      "createdAt": "2023-04-14T07:47:08.000Z",
      "updatedAt": "2023-06-01T11:45:28.000Z",
      "deletedAt": null
    }
  ],
  "responseExamples": [

  ],
  "codeSamples": []
});

