import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/edit-post";
import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import { Icon, CheckboxControl } from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";

import './style.scss';

const ChecklistPlugin = () => {

    const [postFields, setPostFields] = useState([]);
    const [ignore, setIgnore] = useState(false);
    const lock = useDispatch('core/editor').lockPostSaving
    const unlock = useDispatch('core/editor').unlockPostSaving

    const [title, content, featured_media, excerpt, categories, tags] = useSelect((select) => {
        const getField = select('core/editor').getEditedPostAttribute
        const title = getField('title');
        const content = getField('content');
        const featured_media = getField('featured_media');
        const excerpt = getField('excerpt');
        const categories = getField('categories');
        const tags = getField('tags');
        return [title, content, featured_media, excerpt, categories, tags];
    });

    useEffect(() => {

        if ( ! ignore ) {
            if (title === '' || content === '' || excerpt === '' || featured_media === 0 || categories.length === 0 || tags.length === 0) {
                lock();
            } else {
                unlock();
            }
        } else {
            unlock();
        }

        setPostFields([
            {
                name: 'title',
                label: 'Title',
                isPresent: title !== ''
            },
            {
                name: 'content',
                label: 'Content',
                isPresent: content !== ''
            },
            {
                name: 'excerpt',
                label: 'Excerpt',
                isPresent: excerpt !== ''
            },
            {
                name: 'featured_media',
                label: 'Featured Image',
                isPresent: featured_media !== 0
            },
            {
                name: 'categories',
                label: 'Categories',
                isPresent: categories.length !== 0
            },
            {
                name: 'tags',
                label: 'Tags',
                isPresent: tags.length !== 0
            },
        ]);
    }, [ignore, title, content, featured_media, excerpt, categories, tags]);

    return (
        <>
            <PluginDocumentSettingPanel
                title={__("Publish Checklist", "wp-publish-checkist")}
                name="checklist-panel"
                className="checklist-panel"
                intialOpen={true}
            >
                <p>The following post fields need to be entered before you can publish:</p>
                <ul className="checklist-items">
                    {
                        postFields.map((field) => {
                            return (
                                <li key={field.name} className={field.isPresent ? 'present' : 'missing'}>
                                    <Icon icon={field.isPresent ? 'yes' : 'no'} />
                                    <span>{field.label}</span>
                                </li>
                            )
                        })
                    }
                </ul>
                <CheckboxControl
                    label={__("Ignore checklist", "wp-publish-checkist")}
                    checked={ignore}
                    onChange={(value) => {
                        setIgnore(value);
                    }}
                />
            </PluginDocumentSettingPanel>
        </>
    )
}

registerPlugin('publishing-checklist', {
    icon: 'yes',
    render: () => {
        return (
            <ChecklistPlugin />
        )
    }
})
