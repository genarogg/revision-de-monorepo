const $ = (getId: string): HTMLElement | null => {
    return document.getElementById(getId);
};

export { $ };
