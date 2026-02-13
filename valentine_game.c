#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

int main() {
    printf("==============================================\n");
    printf("    Valentine's Day Heart Catching Game\n");
    printf("==============================================\n\n");
    
    // The full path to your HTML file
    // CHANGE THIS to match your actual path!
    const char* html_path = "C:\\Users\\User\\.vscode\\valentine\\valentines-game.html";
    
    printf("Opening game in your default browser...\n");
    printf("File: %s\n\n", html_path);
    
    // Open the HTML file in the default browser
    ShellExecute(NULL, "open", html_path, NULL, NULL, SW_SHOWNORMAL);
    
    printf("Game launched!\n");
    
    printf("To customize the love letter:\n");
    printf("1. Open valentines-game.html in a text editor\n");
    printf("2. Find the <div class=\"letter-content\"> section\n");
    printf("3. Replace the text with your own message\n");
    printf("4. Save and refresh the browser\n\n");
    
    printf("Press Enter to exit...");
    getchar();
    
    return 0;
}