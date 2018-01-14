namespace ElFinder.InternalException
{
    using System;

    public class ElFinderFileNotExists: Exception
    {
        public ElFinderFileNotExists(string message)
            : base(message){}

        public ElFinderFileNotExists():base("Файл не существует или удален. Необходимо обновить страницу."){}
    }
}