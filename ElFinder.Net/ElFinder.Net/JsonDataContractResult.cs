﻿using System;
using System.Net.Mime;
using System.Web;
using Newtonsoft.Json;
using System.Web.Mvc;

namespace ElFinder
{
    
    public class JsonDataContractResult : JsonResult
    {
        public JsonDataContractResult()
        {
        }
        public JsonDataContractResult(object data)
        {
            Data = data;
        }
        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException("context");
            }
            if (JsonRequestBehavior == JsonRequestBehavior.DenyGet &&
                String.Equals(context.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Get is not allowed");
            }

            HttpResponseBase response = context.HttpContext.Response;

            if (!String.IsNullOrEmpty(ContentType))
            {
                response.ContentType = ContentType;
            }
            else
            {
                response.ContentType = "application/json";
            }
            if (ContentEncoding != null)
            {
                response.ContentEncoding = ContentEncoding;
            }
            if (Data != null)
            {
                JsonSerializer serializer = new JsonSerializer();
                serializer.Serialize(response.Output, Data);
            }
        }
    }
}