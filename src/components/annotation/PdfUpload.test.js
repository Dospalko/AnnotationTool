import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PdfUpload from './PdfUpload';

describe('PdfUpload', () => {
    test('renders without crashing', () => {
        render(<PdfUpload />);
    });

    // Add more tests here
});