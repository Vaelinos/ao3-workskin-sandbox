(function () {
  "use strict";

  const DRAFT_STORAGE_KEY = "ao3-local-chapter-draft";
  const BANNED_FREEFORM_TAG = "Pesterlog(s) (Homestuck)";

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toAo3Html(value) {
    const text = (value || "").trim();
    if (!text) {
      return "";
    }
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }
    return text
      .split(/\n{2,}/)
      .map((paragraph) => "<p>" + escapeHtml(paragraph).replace(/\n/g, "<br />") + "</p>")
      .join("");
  }

  function readDraft() {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }

  function stripHtml(value) {
    return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  function splitCommaTags(value) {
    return String(value || "")
      .split(/[,\uFF0C]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function removeBannedFreeformTags(tags) {
    const loweredBannedTag = BANNED_FREEFORM_TAG.toLowerCase();
    return (Array.isArray(tags) ? tags : []).filter(
      (tag) => String(tag || "").toLowerCase() !== loweredBannedTag
    );
  }

  function setCommaList(listElement, items, fallbackItem) {
    if (!listElement) {
      return;
    }

    listElement.innerHTML = "";
    const values = Array.isArray(items) && items.length > 0
      ? items
      : (fallbackItem ? [fallbackItem] : []);

    values.forEach((value) => {
      const li = document.createElement("li");
      li.textContent = value;
      listElement.appendChild(li);
    });
  }

  function setOptionalTagRow(labelElement, valueElement, listElement, items) {
    const hasItems = Array.isArray(items) && items.length > 0;

    if (labelElement) {
      labelElement.hidden = !hasItems;
    }
    if (valueElement) {
      valueElement.hidden = !hasItems;
    }

    if (hasItems) {
      setCommaList(listElement, items);
    } else if (listElement) {
      listElement.innerHTML = "";
    }
  }

  function renderDraft(draft) {
    if (!draft) {
      return;
    }

    const title = document.getElementById("previewWorkTitle");
    const byline = document.getElementById("previewByline");
    const greetingName = document.getElementById("previewGreetingName");
    const summaryModule = document.getElementById("previewSummaryModule");
    const summaryBody = document.getElementById("previewSummaryBody");
    const notesModule = document.getElementById("previewNotesModule");
    const notesBody = document.getElementById("previewNotesBody");
    const chapterBody = document.getElementById("previewChapterBody");
    const endnotesModule = document.getElementById("previewEndnotesModule");
    const endnotesBody = document.getElementById("previewEndnotesBody");
    const previewRatingList = document.getElementById("previewRatingList");
    const previewWarningList = document.getElementById("previewWarningList");
    const previewFandomList = document.getElementById("previewFandomList");
    const previewCategoryLabel = document.getElementById("previewCategoryLabel");
    const previewCategoryValue = document.getElementById("previewCategoryValue");
    const previewCategoryList = document.getElementById("previewCategoryList");
    const previewRelationshipLabel = document.getElementById("previewRelationshipLabel");
    const previewRelationshipValue = document.getElementById("previewRelationshipValue");
    const previewRelationshipList = document.getElementById("previewRelationshipList");
    const previewCharacterLabel = document.getElementById("previewCharacterLabel");
    const previewCharacterValue = document.getElementById("previewCharacterValue");
    const previewCharacterList = document.getElementById("previewCharacterList");
    const previewFreeformList = document.getElementById("previewFreeformList");
    const previewLanguageValue = document.getElementById("previewLanguageValue");
    const workskinStyle = document.getElementById("previewWorkskinStyle");
    const wordCount = document.getElementById("previewWordCount");

    const chapterTitle = (draft.chapterTitle || "").trim();
    const creatorNameOverride = (draft.creatorNameOverride || "").trim();
    const chapterByline = (draft.chapterByline || "").trim();
    const effectiveCreatorName = creatorNameOverride || chapterByline || "Tester";
    const summaryHtml = toAo3Html(draft.chapterSummary || "");
    const notesHtml = toAo3Html(draft.chapterNotes || "");
    const endnotesHtml = toAo3Html(draft.chapterEndnotes || "");
    const contentHtml = toAo3Html(draft.chapterContent || "");
    const contentText = stripHtml(contentHtml);
    const titlePrefix = chapterTitle ? chapterTitle + " - " : "";
    const ratingTags = [(draft.ratingString || "").trim()].filter(Boolean);
    const warningTags =
      Array.isArray(draft.archiveWarningStrings) && draft.archiveWarningStrings.length > 0
        ? draft.archiveWarningStrings
        : ["No Archive Warnings Apply"];
    const fandomTags = splitCommaTags(draft.fandomString || "");
    const categoryTags =
      Array.isArray(draft.categoryStrings) && draft.categoryStrings.length > 0
        ? draft.categoryStrings
        : [];
    const relationshipTags = splitCommaTags(draft.relationshipString || "");
    const characterTags = splitCommaTags(draft.characterString || "");
    const freeformTags = removeBannedFreeformTags(splitCommaTags(draft.freeformString || ""));
    const languageName = (draft.languageName || "").trim() || "English";

    if (title) {
      title.textContent = chapterTitle || "Untitled Chapter";
      document.title = titlePrefix + "AO3 Local Chapter Page";
    }

    if (byline) {
      byline.textContent = effectiveCreatorName;
    }

    if (greetingName) {
      greetingName.textContent = effectiveCreatorName;
    }

    if (summaryModule && summaryBody) {
      if (summaryHtml) {
        summaryModule.hidden = false;
        summaryBody.innerHTML = summaryHtml;
      } else {
        summaryModule.hidden = true;
      }
    }

    if (notesModule && notesBody) {
      if (notesHtml) {
        notesModule.hidden = false;
        notesBody.innerHTML = notesHtml;
      } else {
        notesModule.hidden = true;
      }
    }

    if (chapterBody) {
      chapterBody.innerHTML = contentHtml || "<p>(No chapter text yet.)</p>";
    }

    if (endnotesModule && endnotesBody) {
      if (endnotesHtml) {
        endnotesModule.hidden = false;
        endnotesBody.innerHTML = endnotesHtml;
      } else {
        endnotesModule.hidden = true;
      }
    }

    setCommaList(previewRatingList, ratingTags, "Not Rated");
    setCommaList(previewWarningList, warningTags, "No Archive Warnings Apply");
    setCommaList(previewFandomList, fandomTags, "No Fandom");
    setOptionalTagRow(
      previewCategoryLabel,
      previewCategoryValue,
      previewCategoryList,
      categoryTags
    );
    setOptionalTagRow(
      previewRelationshipLabel,
      previewRelationshipValue,
      previewRelationshipList,
      relationshipTags
    );
    setOptionalTagRow(
      previewCharacterLabel,
      previewCharacterValue,
      previewCharacterList,
      characterTags
    );
    setCommaList(previewFreeformList, freeformTags, "No Additional Tags");

    if (previewLanguageValue) {
      previewLanguageValue.textContent = languageName;
    }

    if (workskinStyle) {
      workskinStyle.textContent = draft.workSkinCss || "";
    }

    if (wordCount) {
      const count = contentText ? contentText.split(" ").length : 0;
      wordCount.textContent = String(count);
    }
  }

  function setupPageToggles() {
    const toggleCommentsTop = document.getElementById("toggleCommentsTop");
    const toggleCommentsFeedback = document.getElementById("toggleCommentsFeedback");
    const comments = document.getElementById("comments");
    const kudoForm = document.getElementById("new_kudo");
    const kudoSubmit = document.getElementById("kudo_submit");
    const kudosMessage = document.getElementById("kudos_message");
    const kudosCount = document.getElementById("previewKudosCount");
    const toggleStyle = document.getElementById("toggleStyle");

    function setCommentsExpanded(expanded) {
      if (!comments) {
        return;
      }

      if (expanded) {
        comments.removeAttribute("hidden");
      } else {
        comments.setAttribute("hidden", "");
      }

      const linkText = expanded ? "Hide Comments" : "Comments";
      if (toggleCommentsTop) {
        toggleCommentsTop.textContent = linkText;
      }
      if (toggleCommentsFeedback) {
        toggleCommentsFeedback.textContent = linkText;
      }
    }

    function handleCommentToggle(event) {
      if (!comments) {
        return;
      }

      if (event) {
        event.preventDefault();
      }

      const expanded = !comments.hasAttribute("hidden");
      const nextExpanded = !expanded;
      setCommentsExpanded(nextExpanded);
      if (nextExpanded) {
        comments.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (comments) {
      setCommentsExpanded(!comments.hasAttribute("hidden"));
    }

    if (toggleCommentsTop) {
      toggleCommentsTop.addEventListener("click", handleCommentToggle);
    }

    if (toggleCommentsFeedback) {
      toggleCommentsFeedback.addEventListener("click", handleCommentToggle);
    }

    if (kudoForm && kudoSubmit) {
      kudoForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (kudoSubmit.disabled) {
          return;
        }

        kudoSubmit.disabled = true;

        if (kudosCount) {
          const current = Number.parseInt(kudosCount.textContent || "0", 10);
          if (!Number.isNaN(current)) {
            kudosCount.textContent = String(current + 1);
          }
        }

        if (kudosMessage) {
          kudosMessage.className = "notice";
          kudosMessage.textContent = "Thank you for leaving kudos!";
        }
      });
    }

    if (toggleStyle) {
      toggleStyle.addEventListener("click", (event) => {
        event.preventDefault();
        const off = document.body.classList.toggle("creator-style-off");
        toggleStyle.textContent = off ? "Show Creator's Style" : "Hide Creator's Style";
      });
    }
  }

  renderDraft(readDraft());
  setupPageToggles();
})();
