import { TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  function setup(multiple = false) {
    TestBed.configureTestingModule({ imports: [FileUploadComponent] });
    const fixture = TestBed.createComponent(FileUploadComponent);
    fixture.componentInstance.accept = '.csv';
    fixture.componentInstance.multiple = multiple;
    fixture.detectChanges();
    const emitted = spyOn(fixture.componentInstance.filesChange, 'emit');
    return { fixture, emitted };
  }
  function drop(fixture: ReturnType<typeof setup>['fixture'], files: File[]) {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    fixture.nativeElement.querySelector('.upload-zone').dispatchEvent(event);
    fixture.detectChanges();
  }
  it('accepts supported dropped files', () => {
    const { fixture, emitted } = setup();
    const file = new File(['name'], 'providers.CSV');
    drop(fixture, [file]);
    expect(emitted).toHaveBeenCalledWith([file]);
  });
  it('rejects unsupported files without replacing the selection', () => {
    const { fixture, emitted } = setup();
    drop(fixture, [new File([''], 'bad.exe')]);
    expect(emitted).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });
  it('enforces the evidence count and size limits', () => {
    const { fixture, emitted } = setup(true);
    fixture.componentInstance.maxFiles = 2;
    fixture.componentInstance.maxFileSize = 2;
    drop(fixture, [new File(['123'], 'large.csv')]);
    expect(emitted).not.toHaveBeenCalled();
    drop(fixture, [1, 2, 3].map(n => new File([''], `${n}.csv`)));
    expect(emitted).not.toHaveBeenCalled();
  });
  it('ignores drops while disabled', () => {
    const { fixture, emitted } = setup();
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    drop(fixture, [new File([''], 'providers.csv')]);
    expect(emitted).not.toHaveBeenCalled();
  });
  it('clears selection using a button that does not submit the form', () => {
    const { fixture, emitted } = setup();
    fixture.componentInstance.files = [new File([''], 'providers.csv')];
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.clear-button');
    expect(button.type).toBe('button');
    button.click();
    expect(emitted).toHaveBeenCalledWith([]);
  });
});
