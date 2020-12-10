import { Asset } from '../types/Asset';
import { Button } from './Button';
import { LabelWithInput } from './LabelWithInput';
import { Loader } from './Loader';
import { Modal } from './Modal';
import client from 'part:@sanity/base/client';
import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';

interface Props {
  asset: Asset;
  loading: Boolean;
  onClose: () => void;
  onSaveComplete: () => void;
  setLoading: (value: Boolean) => void;
}

const StyledFormContainer = styled.form`
  & > :not(:last-child) {
    border-bottom: solid 1px #222;
    margin: 0 0 20px;
    padding: 0 0 20px;
  }
`;

const StyledImageInfoContainer = styled.div`
  display: flex;
`;

const StyledImage = styled.img`
  display: block;
  flex-shrink: 0;
  height: 100px;
  margin: 0 20px 0 0;
  width: 100px;
`;

const StyledInfoContainer = styled.div`
  color: #aaa;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;

  & strong {
    color: #fff;
    display: block;
    font-weight: 500;
    margin: 0 0 1em;
  }
`;

const StyledInputsContainer = styled.div`
  & > :not(:last-child) {
    margin: 0 0 20px;
  }
`;

const StyledButtonsContainer = styled.div`
  align-items: center;
  display: flex;

  & > :not(:last-child) {
    margin: 0 20px 0 0;
  }
`;

export const AssetModal = ({ asset, loading, onClose, onSaveComplete, setLoading }: Props) => {
  const { _createdAt, _id, alt, extension, originalFilename, size, tags, title, url } = asset;
  const [localAlt, setLocalAlt] = useState<string>(alt || '');
  const [localTags, setLocalTags] = useState<string>((tags || []).join(',') || '');
  const [localTitle, setLocalTitle] = useState<string>(title || '');

  const isChanged = localAlt !== (alt || '') || localTags !== (tags?.join(',') || '') || localTitle !== (title || '');

  async function handleSubmit(e: FormEvent) {
    try {
      if (loading) {
        return;
      }

      setLoading(true);
      e.preventDefault();

      if (!isChanged) {
        return onClose();
      }

      const alt = localAlt;
      const tags = localTags.split(',').map((v) => v.trim());
      const title = localTitle;

      await client.patch(_id).set({ alt, tags, title }).commit();
      onSaveComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <StyledFormContainer onSubmit={handleSubmit}>
        <StyledImageInfoContainer>
          <StyledImage alt={alt} src={`${url}?w=100&h=100&fit=crop&auto=format&q=80`} />
          <StyledInfoContainer>
            <strong>{originalFilename}</strong>
            {_createdAt}
            <br />
            3020x2034
            <br />
            {extension.toUpperCase()}, {size}
          </StyledInfoContainer>
        </StyledImageInfoContainer>

        <StyledInputsContainer>
          <LabelWithInput
            label="Alt text"
            onChange={setLocalAlt}
            placeholder={!localAlt ? 'No alt text yet...' : undefined}
            value={localAlt}
          />
          <LabelWithInput
            label="Title"
            onChange={setLocalTitle}
            placeholder={!localTitle ? 'No title yet...' : undefined}
            value={localTitle}
          />
          <LabelWithInput
            label="Tags"
            onChange={setLocalTags}
            placeholder={!localTags ? 'No tags yet...' : undefined}
            value={localTags}
          />
        </StyledInputsContainer>

        <StyledButtonsContainer>
          <Button disabled={!isChanged || loading}>Save Changes</Button>
          <Button secondary onClick={() => onClose()}>
            Cancel
          </Button>
          {loading && <Loader />}
        </StyledButtonsContainer>
      </StyledFormContainer>
    </Modal>
  );
};
