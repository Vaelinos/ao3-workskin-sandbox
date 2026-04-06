(function () {
  "use strict";

  const chapterForm = document.getElementById("chapterForm");
  if (!chapterForm) {
    return;
  }

  const DRAFT_STORAGE_KEY = "ao3-local-chapter-draft";
  const BANNED_FREEFORM_TAG = "Pesterlog(s) (Homestuck)";

  const localFlash = document.getElementById("local-flash");
  const previewButton = document.getElementById("preview_button");
  const saveButton = document.getElementById("save_button");
  const postButton = document.getElementById("post_button");
  const cancelButton = document.getElementById("cancel_button");

  const rtfHtmlSwitch = document.querySelector(".rtf-html-switch");
  const rtfLink = document.querySelector(".rtf-link");
  const htmlLink = document.querySelector(".html-link");
  const htmlNotes = document.querySelector(".html-notes");
  const rtfNotes = document.querySelector(".rtf-notes");

  const contentField = document.getElementById("content");
  const titleField = document.getElementById("chapter_title");
  const bylineField = document.getElementById("chapter_byline");
  const summaryField = document.getElementById("chapter_summary");
  const notesField = document.getElementById("chapter_notes");
  const endnotesField = document.getElementById("chapter_endnotes");
  const workSkinCssField = document.getElementById("work_skin_css");
  const ratingField = document.getElementById("work_rating_string");
  const fandomField = document.getElementById("work_fandom_string");
  const relationshipField = document.getElementById("work_relationship_string");
  const characterField = document.getElementById("work_character_string");
  const freeformField = document.getElementById("work_freeform_string");
  const languageField = document.getElementById("work_language_id");

  const creatorNameToggle = document.getElementById("co-authors-options-show");
  const creatorNameOptions = document.getElementById("co-authors-options");
  const creatorNameOverrideField = document.getElementById("creator_name_override");

  let richTextMode = false;
  let creatorToggleBound = false;

  function showFlash(message) {
    if (!localFlash) {
      return;
    }
    localFlash.textContent = message;
    localFlash.hidden = false;
  }

  function hideFlash() {
    if (!localFlash) {
      return;
    }
    localFlash.hidden = true;
    localFlash.textContent = "";
  }

  function valueWithWindowsNewlineLength(value) {
    return value.replace(/\r\n/g, "\n").replace(/\r|\n/g, "\r\n").length;
  }

  function updateCounterFor(input) {
    if (!input || !input.id) {
      return;
    }
    const counter = document.getElementById(input.id + "_counter");
    if (!counter) {
      return;
    }
    const max = Number(counter.getAttribute("data-maxlength") || 0);
    const remaining = max - valueWithWindowsNewlineLength(input.value);
    counter.textContent = String(remaining);
    counter.setAttribute("aria-valuenow", String(remaining));
  }

  function refreshCharacterCounters() {
    const observed = chapterForm.querySelectorAll(".observe_textlength");
    observed.forEach((input) => updateCounterFor(input));
  }

  function attachCharacterCounters() {
    const observed = chapterForm.querySelectorAll(".observe_textlength");
    observed.forEach((input) => {
      const update = () => updateCounterFor(input);
      input.addEventListener("input", update);
      input.addEventListener("change", update);
      update();
    });
  }

  function initTinyMce() {
    if (!window.tinymce || !contentField) {
      return;
    }

    window.tinymce.init({
      branding: false,
      plugins: "directionality hr image link lists paste tabfocus",
      contextmenu: false,
      menubar: false,
      toolbar:
        "paste | bold italic underline strikethrough | link unlink image | blockquote | hr | bullist numlist | alignleft aligncenter alignright alignjustify | undo redo | ltr rtl",
      browser_spellcheck: true,
      inline_styles: false,
      convert_urls: false,
      content_css: "./site/2.0/21-userstuff.css?" + Date.now(),
      tabfocus_elements: "tinymce",
      extended_valid_elements: "b, i, span[!class|!dir], strike, u",
      invalid_elements: "font",
      formats: {
        alignleft: {
          selector: "div, h1, h2, h3, h4, h5, h6, img, p, table, td, th, ul, ol, li",
          attributes: { align: "left" }
        },
        aligncenter: {
          selector: "div, h1, h2, h3, h4, h5, h6, img, p, table, td, th, ul, ol, li",
          attributes: { align: "center" }
        },
        alignright: {
          selector: "div, h1, h2, h3, h4, h5, h6, img, p, table, td, th, ul, ol, li",
          attributes: { align: "right" }
        },
        alignjustify: {
          selector: "div, h1, h2, h3, h4, h5, h6, img, p, table, td, th, ul, ol, li",
          attributes: { align: "justify" }
        },
        underline: { inline: "u", exact: true },
        strikethrough: [
          { inline: "strike", exact: true },
          { inline: "s", remove: "all" },
          { inline: "del", remove: "all" }
        ]
      },
      paste_word_valid_elements:
        "@[align],-strong/b,-em/i,-u,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,-table,-tr,-td[colspan|rowspan],-th,-thead,-tfoot,-tbody,-a[href|name],sub,sup,strike,br",
      target_list: [{ title: "None", value: "" }],
      mobile: { theme: "silver" },
      setup(editor) {
        editor.on("init change undo redo", () => {
          editor.save();
          contentField.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }
    });
  }

  function addEditor() {
    if (!window.tinymce) {
      return;
    }
    try {
      window.tinymce.execCommand("mceAddEditor", false, "content");
    } catch (_error) {
      // Keep HTML mode usable even if TinyMCE fails to mount.
    }
  }

  function removeEditor() {
    if (!window.tinymce) {
      return;
    }
    try {
      window.tinymce.execCommand("mceRemoveEditor", false, "content");
    } catch (_error) {
      // Ignore remove failures when editor was never mounted.
    }
  }

  function syncEditorContent() {
    if (!window.tinymce) {
      return;
    }
    const editor = window.tinymce.get("content");
    if (editor) {
      editor.save();
    }
  }

  function setEditorMode(nextRichTextMode) {
    richTextMode = nextRichTextMode;

    if (rtfLink && htmlLink) {
      rtfLink.classList.toggle("current", richTextMode);
      htmlLink.classList.toggle("current", !richTextMode);
    }

    if (rtfNotes && htmlNotes) {
      rtfNotes.classList.toggle("hidden", !richTextMode);
      htmlNotes.classList.toggle("hidden", richTextMode);
    }

    if (richTextMode) {
      addEditor();
    } else {
      removeEditor();
    }
  }

  function setupSwitchLinks() {
    if (!rtfHtmlSwitch || !rtfLink || !htmlLink) {
      return;
    }
    rtfHtmlSwitch.classList.remove("hidden");

    rtfLink.addEventListener("click", (event) => {
      event.preventDefault();
      setEditorMode(true);
    });

    htmlLink.addEventListener("click", (event) => {
      event.preventDefault();
      setEditorMode(false);
    });

    setEditorMode(false);
  }

  function syncCreatorNameToggle() {
    if (!creatorNameToggle || !creatorNameOptions) {
      return;
    }

    creatorNameOptions.hidden = !creatorNameToggle.checked;
    if (!creatorNameToggle.checked && creatorNameOverrideField) {
      creatorNameOverrideField.value = "";
    }
  }

  function setupCreatorNameToggle() {
    if (!creatorNameToggle || !creatorNameOptions) {
      return;
    }

    if (!creatorToggleBound) {
      creatorNameToggle.addEventListener("change", syncCreatorNameToggle);
      creatorToggleBound = true;
    }

    syncCreatorNameToggle();
  }

  function getCheckedValues(fieldName) {
    return Array.from(
      chapterForm.querySelectorAll('input[name="' + fieldName + '"]:checked')
    ).map((input) => input.value);
  }

  function setCheckedValues(fieldName, values) {
    const allowed = new Set(Array.isArray(values) ? values.map(String) : []);
    const inputs = chapterForm.querySelectorAll('input[name="' + fieldName + '"]');
    inputs.forEach((input) => {
      input.checked = allowed.has(String(input.value));
    });
  }

  function splitCommaTags(value) {
    return String(value || "")
      .split(/[,\uFF0C]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function withoutBannedFreeformTag(value) {
    const loweredBannedTag = BANNED_FREEFORM_TAG.toLowerCase();
    const filtered = splitCommaTags(value).filter(
      (tag) => tag.toLowerCase() !== loweredBannedTag
    );
    return filtered.join(", ");
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

  function setFieldValue(field, value) {
    if (!field || typeof value !== "string") {
      return;
    }
    field.value = value;
  }

  function applyDraft(draft) {
    if (!draft) {
      return;
    }

    setFieldValue(titleField, draft.chapterTitle || "");
    setFieldValue(summaryField, draft.chapterSummary || "");
    setFieldValue(notesField, draft.chapterNotes || "");
    setFieldValue(endnotesField, draft.chapterEndnotes || "");
    setFieldValue(contentField, draft.chapterContent || "");
    setFieldValue(workSkinCssField, draft.workSkinCss || "");
    setFieldValue(fandomField, draft.fandomString || "");
    setFieldValue(relationshipField, draft.relationshipString || "");
    setFieldValue(characterField, draft.characterString || "");
    setFieldValue(freeformField, withoutBannedFreeformTag(draft.freeformString || ""));

    if (ratingField && typeof draft.ratingString === "string") {
      ratingField.value = draft.ratingString;
    }

    if (languageField && typeof draft.languageId === "string") {
      languageField.value = draft.languageId;
    }

    setCheckedValues("work[archive_warning_strings][]", draft.archiveWarningStrings);
    setCheckedValues("work[category_strings][]", draft.categoryStrings);

    if (creatorNameToggle) {
      const creatorNameEnabled =
        Boolean(draft.creatorNameEnabled) || Boolean((draft.creatorNameOverride || "").trim());
      creatorNameToggle.checked = creatorNameEnabled;
    }

    if (creatorNameOverrideField) {
      creatorNameOverrideField.value = (draft.creatorNameOverride || "").trim();
    }
  }

  function getDraftPayload() {
    syncEditorContent();

    const languageSelectedIndex = languageField ? languageField.selectedIndex : -1;
    const languageName =
      languageField && languageSelectedIndex >= 0
        ? languageField.options[languageSelectedIndex].text
        : "";

    return {
      chapterTitle: titleField ? titleField.value : "",
      chapterByline: bylineField ? bylineField.value : "Tester",
      creatorNameEnabled: Boolean(creatorNameToggle && creatorNameToggle.checked),
      creatorNameOverride:
        creatorNameToggle && creatorNameToggle.checked && creatorNameOverrideField
          ? creatorNameOverrideField.value.trim()
          : "",
      chapterSummary: summaryField ? summaryField.value : "",
      chapterNotes: notesField ? notesField.value : "",
      chapterEndnotes: endnotesField ? endnotesField.value : "",
      chapterContent: contentField ? contentField.value : "",
      workSkinCss: workSkinCssField ? workSkinCssField.value : "",
      ratingString: ratingField ? ratingField.value : "",
      archiveWarningStrings: getCheckedValues("work[archive_warning_strings][]"),
      fandomString: fandomField ? fandomField.value : "",
      categoryStrings: getCheckedValues("work[category_strings][]"),
      relationshipString: relationshipField ? relationshipField.value : "",
      characterString: characterField ? characterField.value : "",
      freeformString: freeformField ? withoutBannedFreeformTag(freeformField.value) : "",
      languageId: languageField ? languageField.value : "",
      languageName
    };
  }

  function persistDraft() {
    try {
      const payload = getDraftPayload();
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function setupFormActions() {
    chapterForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    if (saveButton) {
      saveButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (persistDraft()) {
          window.location.href = "./chapter-preview.html";
        } else {
          showFlash("Draft save failed: local storage is unavailable.");
        }
      });
    }

    if (previewButton) {
      previewButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (persistDraft()) {
          window.location.href = "./chapter-preview.html";
        } else {
          showFlash("Preview failed: local storage is unavailable.");
        }
      });
    }

    if (postButton) {
      postButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (persistDraft()) {
          showFlash("Work posted in local demo mode (no server request).");
        } else {
          showFlash("Post failed: local storage is unavailable.");
        }
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener("click", (event) => {
        event.preventDefault();
        hideFlash();
        chapterForm.reset();
        setupCreatorNameToggle();
        setEditorMode(false);
        if (window.tinymce) {
          const editor = window.tinymce.get("content");
          if (editor) {
            editor.setContent("");
            editor.save();
          }
        }
        refreshCharacterCounters();
      });
    }
  }

  applyDraft(readDraft());
  if (freeformField) {
    freeformField.value = withoutBannedFreeformTag(freeformField.value);
  }
  attachCharacterCounters();
  initTinyMce();
  setupSwitchLinks();
  setupCreatorNameToggle();
  setupFormActions();
})();
