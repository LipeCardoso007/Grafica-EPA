<?php
function ensureUploadsDir()
{
    $dir = __DIR__ . '/../uploads';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function sanitizeFilename($name)
{
    $name = preg_replace('/[^A-Za-z0-9._-]/', '_', $name);
    return $name ?: 'arquivo';
}

function saveUpload($file, $prefix, $allowedExt)
{
  if (!$file || !isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
    return [null, 'Falha no upload.'];
  }
  $original = $file['name'] ?? '';
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    if ($ext === '' || !in_array($ext, $allowedExt, true)) {
        return [null, 'Tipo de arquivo invalido.'];
    }

    $dir = ensureUploadsDir();
    $safeName = sanitizeFilename(pathinfo($original, PATHINFO_FILENAME));
    $filename = sprintf('%s_%s_%s.%s', $prefix, date('Ymd_His'), bin2hex(random_bytes(4)), $ext);
    $target = $dir . '/' . $filename;
  if (!move_uploaded_file($file['tmp_name'], $target)) {
    return [null, 'Nao foi possivel salvar o arquivo.'];
  }
  return [['path' => 'uploads/' . $filename, 'original' => $original], null];
}
