# City of Wesopa — Marketing & Communicatie Toolkit

Interne tools voor het marketing- en communicatieteam van City of Wesopa.

---

## Bestanden

### `wesopa-marketing-toolkit.jsx`
Een AI-aangedreven webtool met drie functies voor het dagelijkse marketingwerk:

| Tab | Functie | Wie gebruikt het |
|-----|---------|-----------------|
| **01 Social Post** | Genereert Instagram- en Facebookberichten op basis van websitetekst | Melissa, Tjitske |
| **02 Trimmen** | Verkort teksten naar 300 tekens (website) of 200 tekens (Gooi Agenda / Weesper Nieuws) | Melissa, Mieke |
| **03 Persbericht** | Beoordeelt en herschrijft persberichtconcepten met feedback | Daphne |

Elke tab heeft een optioneel **Toon & stijl** veld waarmee je de schrijfstijl van de AI kunt bijsturen, bijvoorbeeld:
- `enthousiast en informeel, gebruik jij/jou`
- `professioneel maar toegankelijk, geen vakjargon`
- `zakelijk en bondig`

De uitvoer verschijnt in een ticket-stijl vak met een knop om de tekst direct te kopiëren.

> **Let op:** alle output is een concept. Controleer altijd voor publicatie.

---

## Hoe gebruik je de toolkit?

De toolkit is een React-component (`.jsx`) die draait in [Claude.ai](https://claude.ai) als artifact. Je hebt geen server of installatie nodig.

1. Open Claude.ai
2. Upload het bestand `wesopa-marketing-toolkit.jsx`
3. Vraag Claude om het te openen als artifact
4. De tool is direct bruikbaar in de chat

---

*Intern gebruik — City of Wesopa*
