using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CryptxOnline.Web.Models.MarkerActivation
{
    public class MarkerActivationBase
    {
        public Guid Id { get; set; }
        public MemoryStream PhpSessionStream { get; set; }
        public string CertificateXML { get; set; }


        protected MarkerActivationBase()
        { }

        //public MarkerActivationBase(HttpSessionStateBase session, Guid id)
        //{
        //    Id = id;
        //    AspSession = session;

        //    PhpSessionStream = session[Id.ToString()] as MemoryStream;
            
        //}

        public MarkerActivationBase(MemoryStream phpSession)
        {
            Id = Guid.NewGuid();
            
            PhpSessionStream = phpSession;

            //session[Id.ToString()] = phpSession;
            
        }
        public MarkerActivationBase(MemoryStream phpSession,Guid requestId)
        {
            Id = requestId;

            PhpSessionStream = phpSession;

            //session[Id.ToString()] = phpSession;

        }

        public void LoadCertificateXML(string certificateXML, HttpSessionStateBase session)
        {
            CertificateXML = certificateXML;

            session[Id.ToString()] = this;
        }
    }
}