using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text;

namespace CryptxOnline.Web.Helpers
{
    public class CaptchaGenerator
    {
        public Color backColor = Color.FromArgb(233, 233, 233);
        public String fontName = "Segoe UI";
        public float fontSize = 24.0f;

        public int height = 50;
        public Color textColor = Color.FromArgb(108, 0, 162);
        public int width = 150;

        public CaptchaGenerator()
        {
        }

        public CaptchaGenerator(String _fontName, float _fontSize, Color _textColor, Color _backColor, int _height,
            int _width)
        {
            fontName = _fontName;
            fontSize = _fontSize;
            textColor = _textColor;
            backColor = _backColor;
            height = _height;
            width = _width;
        }

        public Info Run()
        {
            String text = RandomString(6);

            Image img = DrawText(text, new Font(fontName, fontSize), textColor, backColor);

            return new Info
            {
                text = text,
                image = img,
                imageBase64 = ImageToBase64(img, ImageFormat.Png)
            };
        }

        public string ImageToBase64(Image image, ImageFormat format)
        {
            using (var ms = new MemoryStream())
            {
                image.Save(ms, format);
                byte[] imageBytes = ms.ToArray();

                string base64String = Convert.ToBase64String(imageBytes);
                return base64String;
            }
        }

        private Image DrawText(String text, Font font, Color textColor, Color backColor)
        {
            Image img = new Bitmap(1, 1);
            Graphics drawing = Graphics.FromImage(img);

            SizeF textSize = drawing.MeasureString(text, font);

            img.Dispose();
            drawing.Dispose();

            img = new Bitmap(width, height);

            drawing = Graphics.FromImage(img);

            drawing.Clear(backColor);

            Brush textBrush = new SolidBrush(textColor);

            drawing.DrawString(text, font, textBrush, ((float) (width - (int) textSize.Width)/2),
                ((float) (height - (int) textSize.Height)/2));

            drawing.Save();

            textBrush.Dispose();
            drawing.Dispose();

            return img;
        }

        private string RandomString(int size)
        {
            var random = new Random((int) DateTime.Now.Ticks);

            var builder = new StringBuilder();
            char ch;
            for (int i = 0; i < size; i++)
            {
                ch = Convert.ToChar(Convert.ToInt32(Math.Floor(26*random.NextDouble() + 65)));
                builder.Append(ch);
            }

            return builder.ToString();
        }

        public class Info
        {
            public string text { get; set; }
            public Image image { get; set; }
            public String imageBase64 { get; set; }
        }
    }
}