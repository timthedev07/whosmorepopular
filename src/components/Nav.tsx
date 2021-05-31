import React, { useEffect, useState } from "react";

import { Dropdown } from "semantic-ui-react";

export const Nav: React.FC = () => {
    const [windowWidth, setWindowWidth] = useState<number>(
        () => window.innerWidth
    );

    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    return (
        <div className="nav-bar">
            <Dropdown text="File">
                <Dropdown.Menu>
                    <Dropdown.Item icon="trash" text="Sign in to vote" />
                    <Dropdown.Divider />
                    <Dropdown.Item text="Download As..." />
                    <Dropdown.Item text="Publish To Web" />
                    <Dropdown.Item text="E-mail Collaborators" />
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};
