import forge from 'node-forge';
import fs from 'node:fs';
import path from 'node:path';

const CERT_PATH = path.resolve(process.cwd(), '.webmote-certs.json');

export interface StoredCerts {
  certPem: string;
  keyPem: string;
}

export function getOrCreateCertificates(): StoredCerts {
  try {
    if (fs.existsSync(CERT_PATH)) {
      const data = fs.readFileSync(CERT_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.certPem && parsed.keyPem) {
        return parsed;
      }
    }
  } catch {
    console.warn('[Certs] Error reading stored certs, generating new ones...');
  }

  console.log('[Certs] Generating new X.509 client certificate for Android TV Remote...');
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

  const attrs = [
    { name: 'commonName', value: 'WebMote 8-Bit TV Remote' },
    { name: 'organizationName', value: 'WebMote' },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const certPem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

  const stored: StoredCerts = { certPem, keyPem };
  try {
    fs.writeFileSync(CERT_PATH, JSON.stringify(stored, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Certs] Failed to save certs file:', err);
  }

  return stored;
}

export function deleteCertificates(): boolean {
  try {
    if (fs.existsSync(CERT_PATH)) {
      fs.unlinkSync(CERT_PATH);
      console.log('[Certs] Deleted stored certificates (.webmote-certs.json)');
      return true;
    }
  } catch (err) {
    console.error('[Certs] Failed to delete certs file:', err);
  }
  return false;
}
