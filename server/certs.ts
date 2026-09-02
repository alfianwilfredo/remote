import forge from 'node-forge';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function getCertPath(): string {
  try {
    const home = os.homedir();
    if (home) return path.join(home, '.webmote-certs.json');
  } catch {}
  return path.resolve(process.cwd(), '.webmote-certs.json');
}

export interface StoredCerts {
  certPem: string;
  keyPem: string;
}

export function getOrCreateCertificates(): StoredCerts {
  const primaryPath = getCertPath();
  const localFallbackPath = path.resolve(process.cwd(), '.webmote-certs.json');

  try {
    const filePath = fs.existsSync(primaryPath) ? primaryPath : (fs.existsSync(localFallbackPath) ? localFallbackPath : primaryPath);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
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
    fs.writeFileSync(primaryPath, JSON.stringify(stored, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Certs] Failed to save certs file:', err);
  }

  return stored;
}

export function deleteCertificates(): boolean {
  const primaryPath = getCertPath();
  const localFallbackPath = path.resolve(process.cwd(), '.webmote-certs.json');
  let deleted = false;

  try {
    if (fs.existsSync(primaryPath)) {
      fs.unlinkSync(primaryPath);
      deleted = true;
    }
    if (fs.existsSync(localFallbackPath)) {
      fs.unlinkSync(localFallbackPath);
      deleted = true;
    }
    if (deleted) {
      console.log('[Certs] Deleted stored certificates (.webmote-certs.json)');
      return true;
    }
  } catch (err) {
    console.error('[Certs] Failed to delete certs file:', err);
  }
  return false;
}
