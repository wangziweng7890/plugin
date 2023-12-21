# doc2http extension for VS Code

## Description
This extension allows you to create `http-request-template` (eg: swrv or axios ) for your project from api-docs.

The following image is the your document of `apifox`

![apifox-definition](https://s1.imagehub.cc/images/2023/08/16/Snipaste_2023-08-16_09-49-06.png)

the following is the `Remote Explorer`, the structure is the same as the `api-docs-definition`

![Remote Explorer](https://s1.imagehub.cc/images/2023/08/15/Snipaste_2023-08-15_19-34-51.png)

## How to use
1. install this extension
2. `ctrl + shift + p`, input `doc2http:Config` to init your config to tell extension how get apifox data
3. open `Remote Explore`, select any file or any folder
4. click `to swrv` button
5. you will get the `http-request-template` in your project

## example
`request-method-template`

![request-method-template](https://s1.imagehub.cc/images/2023/08/16/Snipaste_2023-08-16_09-41-06.png)

`request-interface-template`

![request-interface-template](https://s1.imagehub.cc/images/2023/08/16/Snipaste_2023-08-16_09-41-09.png)


## other feature
### copy as importFn
copy selected apiName to import {apiName,...} form ApiPath

#### how to use
1. `select apiName` in your file
2. `right click` then click `Copy As ImportFn`
3. you will get paste like `import { useGetChatbotAdminBotIntentDetail, PostChatbotAdminBotIntentBatchProcess } from '@/services/apifox/cHATBOTGuanLiHouTai/jiQiRenYiTuKu/apifox'` in your clipboard

[![Snipaste_2023-08-23_15-09-16.md.png](https://s1.imagehub.cc/images/2023/08/23/Snipaste_2023-08-23_15-09-16.md.png)](https://www.imagehub.cc/image/rR1yLJ)

if you want alias path, you can set alias property in doc2http.json
`
{
  "alias": {
    "@/": "src/"
  }
}
`


