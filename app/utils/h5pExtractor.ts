import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

/**
 * Function to ensure directory exists
 */
export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Function to extract H5P file to a specific directory
 */
export async function extractH5PFile(
  filePath: string,
  destinationDir: string
): Promise<{ success: boolean; contentType?: string; error?: string }> {
  try {
    ensureDirectoryExists(destinationDir);

    // Extract H5P file (which is a ZIP file) to the directory
    const zip = new AdmZip(filePath);
    zip.extractAllTo(destinationDir, true);

    // Parse h5p.json to get content type if it exists
    let contentType = "Unknown";
    const h5pJsonPath = path.join(destinationDir, "h5p.json");

    if (fs.existsSync(h5pJsonPath)) {
      try {
        const h5pJson = JSON.parse(fs.readFileSync(h5pJsonPath, "utf8"));
        contentType = h5pJson.mainLibrary || contentType;
      } catch (err) {
        // Error parsing h5p.json - use default content type
      }
    }

    return {
      success: true,
      contentType,
    };
  } catch (error: any) {
    // H5P extraction failed
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Function to validate H5P file structure
 */
export function validateH5PFile(filePath: string): boolean {
  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    // Check for h5p.json which should be present in valid H5P files
    const hasH5pJson = entries.some((entry) => entry.entryName === "h5p.json");

    // Check for content folder which should contain content.json
    const hasContentJson = entries.some(
      (entry) =>
        entry.entryName === "content/content.json" ||
        entry.entryName === "content.json"
    );
    return hasH5pJson && hasContentJson;
  } catch (error) {
    // H5P validation failed
    return false;
  }
}
