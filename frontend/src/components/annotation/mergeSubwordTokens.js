// PDFTokenViewer.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

function mergeSubwordTokens(tokens, annotations) {
  // Utility function to merge subword tokens
  const mergedTokens = [];
  let currentMergedToken = null;

  for (const token of tokens) {
    // If the currentMergedToken is null, we are starting a new merged token
    if (!currentMergedToken) {
      currentMergedToken = { ...token, subTokens: [token] };
    } else {
      // Append the word to the merged token and add this token to subTokens
      currentMergedToken.word += token.word;
      currentMergedToken.subTokens.push(token);
      // Update the end position to the current token's end position
      currentMergedToken.end = token.end;
    }

    // If the token is followed by a space, or it's the last token, end the current merged token
    if (token.isLastInWord || tokens[tokens.indexOf(token) + 1]?.word.startsWith(' ')) {
      // Assign the annotation from the first sub-token that has an annotation
      for (const subToken of currentMergedToken.subTokens) {
        if (subToken.annotation_id) {
          const annotation = annotations.find(a => a.id === subToken.annotation_id);
          currentMergedToken.annotation = annotation;
          break;
        }
      }

      mergedTokens.push(currentMergedToken);
      currentMergedToken = null;
    }
  }

  return mergedTokens;
}
export default mergeSubwordTokens