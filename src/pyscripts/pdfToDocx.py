#!/usr/bin/env python3

from pdf2docx import Converter

def convert_pdf_to_docx(pdf_path, docx_path):
    cv = Converter(pdf_path)
    cv.convert(docx_path, start=0, end=None)
    cv.close()


if __name__ == "__main__":
    import sys
    print(sys.argv)
    convert_pdf_to_docx(sys.argv[1], sys.argv[2])
