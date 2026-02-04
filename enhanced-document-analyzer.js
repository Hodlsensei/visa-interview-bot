// Enhanced Document Analyzer
function generateDocumentContext(uploadedDocuments) {
  if (!uploadedDocuments) {
    return '\n\n[DOCUMENT STATUS]: No documents uploaded yet.';
  }

  let context = '\n\n[DOCUMENT STATUS]:';
  
  // Check passport
  if (uploadedDocuments.passport && uploadedDocuments.passport.length > 0) {
    context += '\n✅ Passport: Provided';
  } else {
    context += '\n❌ Passport: MISSING (CRITICAL - Cannot proceed without passport)';
  }

  // Check financial proof
  if (uploadedDocuments.financialProof && uploadedDocuments.financialProof.length > 0) {
    context += '\n✅ Financial Proof: Provided';
  } else {
    context += '\n⚠️ Financial Proof: MISSING (Bank statements required)';
  }

  // Check supporting documents
  if (uploadedDocuments.supportingDocuments && uploadedDocuments.supportingDocuments.length > 0) {
    context += '\n✅ Supporting Documents: Provided';
  } else {
    context += '\n⚠️ Supporting Documents: MISSING (Employment letter, invitation, etc.)';
  }

  return context;
}

module.exports = { generateDocumentContext };// Enhanced Document Analyzer
function generateDocumentContext(uploadedDocuments) {
  if (!uploadedDocuments) {
    return '\n\n[DOCUMENT STATUS]: No documents uploaded yet.';
  }

  let context = '\n\n[DOCUMENT STATUS]:';
  
  // Check passport
  if (uploadedDocuments.passport && uploadedDocuments.passport.length > 0) {
    context += '\n✅ Passport: Provided';
  } else {
    context += '\n❌ Passport: MISSING (CRITICAL - Cannot proceed without passport)';
  }

  // Check financial proof
  if (uploadedDocuments.financialProof && uploadedDocuments.financialProof.length > 0) {
    context += '\n✅ Financial Proof: Provided';
  } else {
    context += '\n⚠️ Financial Proof: MISSING (Bank statements required)';
  }

  // Check supporting documents
  if (uploadedDocuments.supportingDocuments && uploadedDocuments.supportingDocuments.length > 0) {
    context += '\n✅ Supporting Documents: Provided';
  } else {
    context += '\n⚠️ Supporting Documents: MISSING (Employment letter, invitation, etc.)';
  }

  return context;
}

module.exports = { generateDocumentContext };