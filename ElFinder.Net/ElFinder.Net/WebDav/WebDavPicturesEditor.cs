using System.Drawing;
using System.IO;
using WebDav;

namespace ElFinder.WebDav
{
    /// <summary>
    /// Represents default pictures editor
    /// </summary>
    internal class WebDavPicturesEditor : DefaultPicturesEditor
    {
        WebDavClient client;

        public WebDavPicturesEditor(WebDavClient client, Color backgroundColor)
        {
            _backgroundColor = backgroundColor;
            this.client = client;
        }

        public WebDavPicturesEditor(WebDavClient client) : base(Color.Transparent) 
        {
            this.client = client;
        }

        public override void Resize(string file, int width, int height)
        {
            ImageWithMime output;
            var content = client.Download(file);
            using (var ms = new MemoryStream(content))
            {
                using (Image inputImage = Image.FromStream(ms))
                {
                    output = ScaleOrCrop(inputImage, new Rectangle(0, 0, inputImage.Width, inputImage.Height), new Rectangle(0, 0, width, height));
                }

                client.Upload(file, output.ImageStream);
            }
        }

        public override void Crop(string file, int x, int y, int width, int height)
        {
            ImageWithMime output;
            var content = client.Download(file);
            using (var ms = new MemoryStream(content))
            {
                using (Image inputImage = Image.FromStream(ms))
                {
                    output = ScaleOrCrop(inputImage, new Rectangle(x, y, width, height), new Rectangle(0, 0, width, height));
                }

                client.Upload(file, output.ImageStream);
            }
        }

        public override void Rotate(string file, int angle)
        {
            ImageWithMime output;
            var content = client.Download(file);
            using (var ms = new MemoryStream(content))
            {
                using (Image inputImage = Image.FromStream(ms))
                {
                    output = Rotate(inputImage, angle);
                }

                client.Upload(file, output.ImageStream);
            }
        }

        public Size GetSize(string file)
        {
            var content = client.Download(file);
            using(var ms = new MemoryStream(content))
            {
                var image = Image.FromStream(ms);
                return image.Size;
            }
        }
    }
}
