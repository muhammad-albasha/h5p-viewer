import { PageSettingsService } from "./services/PageSettingsService";
import HomePageContent from "./components/HomePage";

export default async function Home() {
  // Fetch hero settings from database
  const pageSettingsService = new PageSettingsService();

  let heroSettings;
  try {
    heroSettings = await pageSettingsService.getHeroSettings();
  } catch (error) {
    console.error("Error fetching hero settings:", error);
    // Fallback to default values
    heroSettings = {
      title: "H5P-Viewer",
      subtitle: "Interaktive Lerninhalte für dein Studium",
      description:
        "Entdecke eine vielfältige Sammlung von interaktiven H5P-Elementen, die das Lernen spannend und effektiv machen. Von Quizzes über Präsentationen bis hin zu interaktiven Videos – hier findest du alles für ein modernes Lernerlebnis.",
    };
  }

  return <HomePageContent heroSettings={heroSettings} />;
}
