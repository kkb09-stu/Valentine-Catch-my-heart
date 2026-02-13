#include <stdio.h> 
#include <stdlib.h>
#include <string.h>

#define WEBVIEW_IMPLEMENTATION
#include "webview.h"
#include <windows.h>

char* escape_quote(const char* str);
char* read_love_letter(const char* filename);
char* generate_love_letter_html();

int main()
{
    printf("Starting Game......\n");

    webview_t web = webview_create(0, NULL); // Create Webview

    if(!web)
    {
        fprintf(stderr, "Failed to create Webview\n");
        return 1;
    }

    // Set Window
    webview_set_title(web, "Catch My Love! 💕");
    webview_set_size(web, 900, 850, WEBVIEW_HINT_NONE);

    // Path to html file
    const char* html_path = "file:///C:/Users/User/.vscode/valentine/valentines-game.html";

    printf("Loading game from %s\n", html_path);
    webview_navigate(web, html_path); // Find the Html file

    char* Letter_html = generate_love_letter_html();

    if(Letter_html) 
    {
        char* escaped_letter = escape_quote(Letter_html);

        if (escaped_letter)
        {
            char command[8192];
            snprintf(command, sizeof(command),
                     "setTimeout(function() { "
                     "  updateLoveLetterContent('%s'); "
                     "}, 1000);", // Wait 1 second for page to load
                     escaped_letter);
            
            webview_eval(web, command);
            printf("Love letter injected successfully!\n");

            free(escaped_letter);
        }
        free(Letter_html);

        printf("Game window opened! Close the window to exit.\n");

        webview_run(web);

        webview_destroy(web);

        printf("Game closed. Happy Valentine's Day!\n");
        return 0;
    }
}

char* escape_quote(const char* str) // Escape from html path
{
    if (str == NULL)
    {
        return NULL;
    }

    size_t len = strlen(str);
    size_t new_len = len;

    for(size_t i = 0; i < len; i++)
    {
        if (str[i] == '"' || str[i] == '\'')
        {
            new_len++;
        }

        char* escaped = (char*) malloc(new_len + 1);
        if(!escaped)
        {
            return NULL;
        }

        size_t j = 0;
        for (size_t i = 0; i < len; i++)
        {
            if (str[i] == '"' || str[i] == '\'')
            {
                escaped[j++] = '\\';
            }

            escaped[j++] = str[i];
        }

        escaped[j] = '\0';

        return escaped;
    }

}

char* read_love_letter(const char* filename)
{
    FILE* file = fopen(filename, "r");
    if (file == false)
    {
        fprintf(stderr, "Warning: Could not open %s, using default letter\n", filename);
        return NULL;
    }

    // Get File size

    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    fseek(file, 0, SEEK_SET);

    // Read File
    char* content = (char*) malloc(size + 1);

    if(!content)
    {
        fclose(file);
        return NULL;
    }

    fread(content, 1, size, file);
    content[size] = '\0';
    fclose(file);

    return content;
}

char* generate_love_letter_html()
{
    const char* letter_template =
        "<p>My Ayuuu Yoon Yoon,</p>"
        "<p>First of all, I am really sorry for acting like a child the other day."
        "<p>I just wanna thank you for accepting me again, and I promise that I will try my best"
        "to make up for my mistakes.</p>"
        "<p>You make me laugh, you make me think, and most importantly, "
        "you make me want to be a better person. Thank you for being "
        "my partner, my best friend, and my everything ayuuu.</p>"
        "<p>I know you caught all the heart in this game just like you caught mine. </p>"
        "<p>Happy Valentine's Day, my Boooo! Here's to many more "
        "adventures together.</p>"
        "<p class=\"letter-signature\">Forever yours,<br>Your [Stupid Boyfriend]💗💗💗</p>";

    char* letter = (char*) malloc(strlen(letter_template) + 1);
    strcpy(letter, letter_template);
    return letter;
}