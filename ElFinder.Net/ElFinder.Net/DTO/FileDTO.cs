using System;
using System.ComponentModel;
using System.IO;
using System.Runtime.Serialization;

namespace ElFinder.DTO
{
    public enum VisualizationType
    {
        NotSupport = 0,
        Office = 1,
        Picture = 2,
        Xml=3
    }
    [DataContract]
    public enum ImageFileExtensions
    {
        [EnumMember]
        [Description("pic")]
        pic,
        [EnumMember]
        [Description("bmp")]
        bmp,
        [EnumMember]
        [Description("cr2")]
        cr2,
        [EnumMember]
        [Description("gif")]
        gif,
        [EnumMember]
        [Description("icon")]
        icon,
        [EnumMember]
        [Description("icn")]
        icn,
        [EnumMember]
        [Description("jpe")]
        jpe,
        [EnumMember]
        [Description("jpeg")]
        jpeg,
        [EnumMember]
        [Description("jpg")]
        jpg,
        [EnumMember]
        [Description("png")]
        png,
        [EnumMember]
        [Description("tif")]
        tif,
        [EnumMember]
        [Description("tiff")]
        tiff,
        [EnumMember]
        [Description("cdr")]
        cdr
    }
    [DataContract]
    public enum OfficeFileExtensions
    {
        [EnumMember]
        [Description("pdf")]
        pdf,
        [EnumMember]
        [Description("ods")]
        ods,
        [EnumMember]
        [Description("xls")]
        xls,
        [EnumMember]
        [Description("xlsb")]
        xlsb,
        [EnumMember]
        [Description("xlsm")]
        xlsm,
        [EnumMember]
        [Description("xlsx")]
        xlsx,
        [EnumMember]
        [Description("one")]
        one,
        [EnumMember]
        [Description("onetoc2")]
        onetoc2,
        [EnumMember]
        [Description("onepkg")]
        onepkg,
        [EnumMember]
        [Description("odp")]
        odp,
        [EnumMember]
        [Description("pot")]
        pot,
        [EnumMember]
        [Description("potm")]
        potm,
        [EnumMember]
        [Description("potx")]
        potx,
        [EnumMember]
        [Description("pps")]
        pps,
        [EnumMember]
        [Description("ppsm")]
        ppsm,
        [EnumMember]
        [Description("ppsx")]
        ppsx,
        [EnumMember]
        [Description("ppt")]
        ppt,
        [EnumMember]
        [Description("pptm")]
        pptm,
        [EnumMember]
        [Description("pptx")]
        pptx,
        [EnumMember]
        [Description("doc")]
        doc,
        [EnumMember]
        [Description("docm")]
        docm,
        [EnumMember]
        [Description("docx")]
        docx,
        [EnumMember]
        [Description("dot")]
        dot,
        [EnumMember]
        [Description("dotm")]
        dotm,
        [EnumMember]
        [Description("dotx")]
        dotx,
        [EnumMember]
        [Description("odt")]
        odt


    }



    [DataContract]
    public class FileDTO : DTOBase
    {
        /// <summary>
        ///  Hash of parent directory. Required except roots dirs.
        /// </summary>
        [DataMember(Name = "phash")]
        public string ParentHash { get; set; }
        [DataMember(Name = "VisualizationType")]
        public VisualizationType VisualizationType { get; set; }

        public static VisualizationType GetVisualization(string extension)
        {
            if (string.IsNullOrEmpty(extension))
            {
                return VisualizationType.NotSupport; 
            }
            //ищем картинки
            if (Enum.IsDefined(typeof(ImageFileExtensions), extension.Remove(0, 1).ToLower()))
            {
                return VisualizationType.Picture;
            }
            //ищем картинки
            if (Enum.IsDefined(typeof(OfficeFileExtensions), extension.Remove(0, 1).ToLower()))
            {
                return VisualizationType.Office;
            }
            //xml
            if (extension.Remove(0, 1).ToLower() == "xml")
            {
                return VisualizationType.Xml;
            }
            
            return VisualizationType.NotSupport;
        }
    }
}