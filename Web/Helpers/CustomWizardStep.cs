namespace CryptxOnline.Web.Helpers
{
    /// <summary>
    ///     Шаг визарда
    /// </summary>
    public class CustomWizardStep
    {
        /// <summary>
        ///     УИД шага
        /// </summary>
        public string Step { get; set; }

        /// <summary>
        ///     Читаемое имя шага РУС
        /// </summary>
        public string StepText { get; set; }

        /// <summary>
        ///     Шаг для перехода на предыдущую страницу
        /// </summary>
        public string PreviousStep { get; set; }

        /// <summary>
        ///     Шаг для перехода на следующую страницу
        /// </summary>
        public string NextStep { get; set; }
    }
}