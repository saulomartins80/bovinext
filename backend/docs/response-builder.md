# ResponseBuilder Documentation

## Overview

The ResponseBuilder is a utility class to manage response templates and build customized responses for different intents in the financial assistant platform.

## Functionalities

- **Template Loading**: Loads response templates from a predefined JSON file.
- **Response Retrieval**: Provides responses based on the intent and phase of conversation.
- **Variable Substitution**: Replaces placeholders in templates with actual values.
- **Contextual Suggestions**: Recommends actions based on user context and previous actions.
- **Personalized Responses**: Customizes responses based on user subscriptions, financial status, and user history.
- **Default Responses**: Provides a generic response if no specific template is available.

## Implementation Details

- **Template Path:** `src/assets/response_templates.json`
- **Main Methods:**
  - `getResponse(intent: string, phase: string, variables?: any): string`
  - `getContextualSuggestions(context: any): string[]`
  - `getPersonalizedResponse(intent: string, phase: string, context: any, variables?: any): string`
- **Response Customization:**
  - **Enterprise Touch:** Adds corporate jargon for enterprise users.
  - **Urgency Touch:** Emphasizes urgency in responses for critical financial situations.
  - **Welcome Touch:** Adds a welcoming message for new users.

